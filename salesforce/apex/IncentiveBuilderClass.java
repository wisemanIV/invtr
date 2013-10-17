public class IncentiveBuilderClass {

    Incentive__c incentive ;
    IncentiveRule__c rule ;
    IncentiveMetric__c metric ;
    public Boolean typeUpdate { get; set;} 
    static Map<String,Schema.SObjectType> gd = Schema.getGlobalDescribe();  
    
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
    
    public IncentiveMetric__c getMetric() {
          if(metric == null) metric = new IncentiveMetric__c();
          return metric;
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
    
    public List<IncentiveMetric__c> metrics {
        get { 
            if (metrics == null) metrics = new List<IncentiveMetric__c>();
            return metrics;
        }
        set;
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
    
    public List<IncentiveMetric__c> getAvailableMetrics() {
        List<IncentiveMetric__c> metrics = new List<IncentiveMetric__c>();
        
        for( IncentiveRule__c rule : rules)
        {
            if (rule.PointsField__c != null) 
                metrics.add(buildMetric(rule.Object__c, rule.PointsField__c));
            
            if (rule.Field__c != null) 
                metrics.add(buildMetric(rule.Object__c, rule.Field__c));
        }
        
        return metrics;
        
    }
    
    private IncentiveMetric__c buildMetric(String objectName, String fieldName) {
        IncentiveMetric__c metric = new IncentiveMetric__c() ;
        
        metric.Object__c = objectName ;
        metric.Field__c = fieldName ;
        metric.IsDisplayed__c = false ;
        metric.Target__c = 0 ;
        
        return metric ;
    }
    
    public PageReference cancel() {
      return Page.InvAdmin;
    }
    
    public PageReference step1() {
      incentive.Active__c = false ;
      incentive.Url__c = 'https://'+incentive.Name+'.invtr.co';
        
      // create the incentive record
      insert incentive ;
      return Page.InvRules;
    }
 
   public PageReference step2() {
      return Page.InvMetrics;
   }
 
   public PageReference step3() {
      insert metrics ;
      return save(JSON.serializePretty(incentive));
   }
   
   public PageReference addRule() {
       // store new rule
       insert rule ;
       IncentiveRule__c irClone = rule.clone();
       
       irClone.Id = rule.Id;
       // refresh local copy
       rules.add(irClone);
       rule.clear();
       return ApexPages.CurrentPage();
   }
   
   public PageReference addMetric() {
       metrics.add(metric.clone()) ;
       metric.clear();
       return ApexPages.CurrentPage();
   }
    
    public PageReference save(String body) {
    
        HttpRequest req = new HttpRequest();
            
        System.debug(body) ;
         
        //Set HTTPRequest Method
        req.setMethod('POST');

        //Set HTTPRequest header properties
        req.setHeader('content-type', 'application/x-www-form-urlencoded');
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