public class IncentiveBuilderClass {

    Incentive__c incentive ;
    IncentiveRule__c rule ;
    public Boolean typeUpdate { get; set;} 
    static Map<String,Schema.SObjectType> gd = Schema.getGlobalDescribe();  
    
    
    public void selectEvent() {
        
        List<IncentiveRule__c> events = getSystemRules() ;
        
        for (IncentiveRule__c event: events) {
            if (event.Title__c == rule.Title__c) {
                // TODO make thi more intelligent by looping through fields. implemented in clone function
                rule.Object__c = event.Object__c ;
                rule.Field__c = event.Field__c ;
                rule.DisplayFormat__c = event.DisplayFormat__c ;
                rule.DisplayLabel__c = event.DisplayLabel__c ;
                rule.DisplayPointsFieldLabel__c = event.DisplayPointsFieldLabel__c ;
                rule.DisplayPointsFieldFormat__c = event.DisplayPointsFieldFormat__c ;
                rule.PointsFieldTarget__c = event.PointsFieldTarget__c ;
                rule.Title__c = event.Title__c ;
                rule.Type__c = event.Type__c ;
                rule.StartValue__c = event.StartValue__c ;
                rule.EndValue__c = event.EndValue__c ;
                break;
            }
        }
    }
    
    public void toggleType() {
        ApexPages.Message myMsg = new ApexPages.Message(ApexPages.Severity.ERROR,'Error: Invalid Input.');
        if (rule.Type__c != null && rule.Type__c =='Update') {
                typeUpdate = true ;
        } else {
            typeUpdate = false ;
        }
    }
    
    public Incentive__c getIncentive() {
          if(incentive == null) incentive = new Incentive__c();
          return incentive;
    }
    
    public IncentiveRule__c getRule() {
          if(rule == null) rule = new IncentiveRule__c();
          return rule;
    }
    
    public List<IncentiveRule__c> rules {
        get { 
            if (rules == null) rules = new List<IncentiveRule__c>();
            return rules;
        }
        set;
    }
    
    public void removeRule() {
        Id ruleId = ApexPages.currentPage().getParameters().get('ruleId');
        
        IncentiveRule__c r = [Select Id from IncentiveRule__c where Id = :ruleId];
        
        delete r ;
    }
    
    public List<SelectOption> getNumericFields()   
    {  
        List<SelectOption> fields = new List<SelectOption>();
        fields.add(new SelectOption('-- None --', '-- None --')); 
      
        Schema.SObjectType sobjType = gd.get(rule.Object__c);  
        if (sobjType != null) {
        Schema.DescribeSObjectResult r = sobjType.getDescribe();  
        Map<String,Schema.SObjectField> M = r.fields.getMap(); 
      
        for(String fieldName : M.keyset())  
            {
                Schema.SObjectField field = M.get(fieldName);                                                      
                Schema.DescribeFieldResult fieldDesc = field.getDescribe();  
                
                if (Schema.DisplayType.Integer == fieldDesc.getType() || Schema.DisplayType.Double == fieldDesc.getType() || Schema.DisplayType.Currency == fieldDesc.getType()) {
                    fields.add(new SelectOption(fieldName.toLowerCase(), fieldDesc.getLabel())); 
                }
            }  
        }
      
        fields.sort();
        return fields;  
    }  
    
    public List<SelectOption> getSobjectFields()   
    {  
        List<SelectOption> fields = new List<SelectOption>();
        fields.add(new SelectOption('-- None --', '-- None --')); 
      
        Schema.SObjectType sobjType = gd.get(rule.Object__c);  
        if (sobjType != null) {
        Schema.DescribeSObjectResult r = sobjType.getDescribe();  
        Map<String,Schema.SObjectField> M = r.fields.getMap();  
      
        for(String fieldName : M.keyset())  
            {  
                Schema.SObjectField field = M.get(fieldName);                                                      
                Schema.DescribeFieldResult fieldDesc = field.getDescribe();  
                fields.add(new SelectOption(fieldName.toLowerCase(), fieldDesc.getLabel())); 
            }  
        }
      
        fields.sort();
        return fields;  
    }      
    
    public List<SelectOption> getObjectNames()
    {
       List<Schema.SObjectType> gdo = Schema.getGlobalDescribe().Values(); 
       List<SelectOption> options = new List<SelectOption>();
       
       options.add(new SelectOption('-- Select --', '-- Select --'));
       
       for(Schema.SObjectType f : gdo)
       {
           Schema.SObjectType sobjType = gd.get(f.getDescribe().getLabel());  
           if (sobjType != null) {
              options.add(new SelectOption(f.getDescribe().getLabel(),f.getDescribe().getLabel()));
           }
       }
       options.sort();
       return options;
      
    }
    
    public static List<IncentiveRule__c> getSystemRules() {
        List<Incentive__c> incentive = new List<Incentive__c>([select Id from Incentive__c where Name = 'SYSTEM']);
        List<IncentiveRule__c> events = new List<IncentiveRule__c>(); 
        
        if (incentive != null && incentive.size() > 0) events = CalculateMetrics.getRules(incentive[0].Id);
    
        return events ;
    }
    
    public List<SelectOption> getEvents()
    {
       List<IncentiveRule__c> events = getSystemRules();
       List<SelectOption> options = new List<SelectOption>();
       
       options.add(new SelectOption('-- Select --', '-- Select --'));
       
       for(IncentiveRule__c event : events)
       {
           if (event.Title__c != null && event.Title__c != '') {
              options.add(new SelectOption(event.Title__c , event.Title__c ));
           }
       }
       options.sort();
       return options;
      
    }
    
    public List<SelectOption> getTypes()
    {
      List<SelectOption> options = new List<SelectOption>();
        
       Schema.DescribeFieldResult fieldResult =
       IncentiveRule__c.Type__c.getDescribe();
       List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
        
       for( Schema.PicklistEntry f : ple)
       {
          options.add(new SelectOption(f.getLabel(), f.getValue()));
       }       
       return options;
    }
    
    
    public PageReference cancel() {
      rule = null; incentive = null ;
      return Page.InvAdmin;
    }
    
    public PageReference back() {
      rule = null ;
      return Page.InvNewIncentive;
    }
    
    public PageReference step1() {
      incentive.Active__c = false ;
      incentive.Url__c = 'https://'+incentive.Name+'.invtr.co';
        
      // create the incentive record
      insert incentive ;
      return Page.InvRules;
    }
 
   public PageReference step2() {
      return save(JSON.serializePretty(incentive));
   }
 
   
   public PageReference addRule() {
       // store new rule
       rule.IncentiveId__c = incentive.Id;
       insert rule ;
       IncentiveRule__c irClone = rule.clone();
       
       irClone.Id = rule.Id;
       // refresh local copy
       rules.add(irClone);
       rule.clear();
       return ApexPages.CurrentPage();
   }
    
    public PageReference save(String body) {
    
        HttpRequest req = new HttpRequest();
            
        System.debug(body) ;
         
        //Set HTTPRequest Method
        req.setMethod('POST');

        //Set HTTPRequest header properties
        req.setHeader('content-type',  'application/json');
        //req.setHeader('Host','data.invtr.co');
        req.setEndpoint('https://data.invtr.co/incentivebuilder');
        req.setHeader('Connection','keep-alive');

        //Set the HTTPRequest body  
        req.setBody(body);   

        Http http = new Http();
        
        PageReference pageRef = Page.InvAdmin;
        pageRef.setRedirect(true);
  
        try {
 
            //Execute web service call here    
            HTTPResponse res = http.send(req);  

            //Helpful debug messages
            System.debug(res.toString());
            System.debug('STATUS:'+res.getStatus());
            System.debug('STATUS_CODE:'+res.getStatusCode());
            
            if (res.getStatusCode() != 200) {
                
                String msg = 'code:'+res.getStatusCode()+' reason:'+res.getStatus() ;
                ApexPages.Message myMsg = new ApexPages.Message(ApexPages.Severity.FATAL, msg);
                
                ApexPages.addMessage(myMsg);
                pageRef = ApexPages.CurrentPage();
            }
    
        } catch(System.CalloutException e) {
            System.debug(e);
            ApexPages.addMessages(e);
            pageRef = ApexPages.CurrentPage();
        }
        
        return pageRef;
    }
    
   
}