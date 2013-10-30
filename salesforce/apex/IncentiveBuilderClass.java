public class IncentiveBuilderClass {

    Map<Id, Incentive> templates ;
    Incentive incentive ;
    public Id incentiveTemplateId { get; set;} 
    IncentiveRule__c rule ;
    public Boolean typeUpdate { get; set;} 
    static Map<String,Schema.SObjectType> gd = Schema.getGlobalDescribe(); 
    
    public IncentiveBuilderClass() {
        getSystemIncentives();
    }
    
    public void selectIncentiveType() {
        
        Incentive template = templates.get(incentiveTemplateId);
        
        incentive.cloneRules(template) ;
        
    }
    
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
                rule.UserIdField__c = 'OwnerId';
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
          if(incentive == null) incentive = new Incentive();
          return incentive.getRecord();
    }
    
    public IncentiveRule__c getRule() {
          if(rule == null) rule = new IncentiveRule__c();
          return rule;
    }
    
    public List<IncentiveRule__c> getRules() {
        if (incentiveTemplateId == null) {
            return new List<IncentiveRule__c>();
        } else {
            return templates.get(incentiveTemplateId).getRules();
        }
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
        List<Incentive__c> incentive = new List<Incentive__c>([select Id, Title__c from Incentive__c where Name = 'SYSTEM']);
        List<IncentiveRule__c> events = new List<IncentiveRule__c>(); 
        
        if (incentive != null && incentive.size() > 0) events = CalculateMetrics.getRules(incentive[0].Id);
    
        return events ;
    }
    
    public Map<Id, Incentive> getSystemIncentives() {
        
        if (templates == null) {
            templates = new Map<Id, Incentive>();
            List<Incentive__c> systemIncentives = new List<Incentive__c>([select Id, Title__c from Incentive__c where Name = 'SYSTEM']);
            
            for (Incentive__c systemIncentive: systemIncentives) {
                Incentive i = new Incentive(systemIncentive) ;
                templates.put(systemIncentive.Id, i);
            }
        }
        
        return templates ;
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
    
    public List<SelectOption> getIncentiveTypes()
    {
       List<Incentive> incentiveTypes = getSystemIncentives().values();
       List<SelectOption> options = new List<SelectOption>();
       
       options.add(new SelectOption('-- Select --', '-- Select --'));
       
       for(Incentive incentive: incentiveTypes)
       {
           if (incentive.getRecord().Title__c != null && incentive.getRecord().Title__c != '') {
              options.add(new SelectOption(incentive.getRecord().Id, incentive.getRecord().Title__c ));
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
      incentive.getRecord().Active__c = false ;
      incentive.getRecord().Url__c = 'https://'+incentive.getRecord().Name+'.invtr.co';
        
      return Page.InvRules;
    }
 
   public PageReference step2() {
       
      List<User> ids = new List<User>([select Id from User where ProfileId in ('00ei00000013M1P','00ei00000013M1b','00ei00000013M1M','00ei00000013M1bAAE') and Id != :UserInfo.getUserId()]) ;
      Id groupId = IncentiveBuilderClass.createGroup(incentive.getRecord().ChatterGroupTitle__c, ids);
      incentive.getRecord().ChatterGroupId__c = groupId ;
      incentive.save() ;
      save(incentive.getRecord().Id, JSON.serializePretty(incentive.getRecord()));
      PageReference pageRef = Page.InvAdmin;
      
      return pageRef.setRedirect(true);
   }
 
    @future (callout=true)
    public static void save(Id incentiveId, String body) {
    
        Incentive__c irec = [select Id, Url__c from Incentive__c where Id = :incentiveId];
    
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
       
        try {
 
            //Execute web service call here    
            HTTPResponse res = http.send(req);  

            //Helpful debug messages
            System.debug(res.toString());
            System.debug('STATUS:'+res.getStatus());
            System.debug('STATUS_CODE:'+res.getStatusCode());
            
            if (res.getStatusCode() != 200) {
                
                String msg = 'code:'+res.getStatusCode()+' reason:'+res.getStatus() ;
                irec.Url__c = res.getStatus() ;
                update irec ;
            }
    
        } catch(System.CalloutException e) {
            System.debug(e);
            irec.Url__c = e.getMessage() ;
            update irec;
            
        }
        
    }
    
    public static Id createGroup(String groupName, List<User> users) {
        
        CollaborationGroup g = new CollaborationGroup(Name=groupName, CollaborationType='Public');
        g.OwnerId = UserInfo.getUserId() ;
        insert g;
        
        List<CollaborationGroupMember> groupMembers = new List<CollaborationGroupMember>();
        
        for (User user: users) {
            CollaborationGroupMember member = new CollaborationGroupMember();
            member.MemberId = user.Id ;
            member.CollaborationGroupId = g.Id ;
            groupMembers.add(member);
        }
                  
        insert groupMembers;
        return g.Id ;
    }
    
   
}