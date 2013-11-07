public class IncentiveBuilderClass {

    Id templateId ;
    Map<Id, Incentive> templates ;
    Incentive incentive ;
    IncentiveRule__c rule ;
    public Boolean typeUpdate { get; set;}
    static Map<String,Schema.SObjectType> gd = Schema.getGlobalDescribe(); 
    Set<Id> events ;
    String currObj { get; set;}
    // display variables
    public boolean showTarget {get;set;}
    public boolean showPointsTarget {get;set;}
    public boolean showPointsMultiplier {get;set;}
    public boolean showPointsValue {get;set;}
    public boolean showPointsField {get;set;}
    public boolean showEvents {get;set;}
    public boolean showPrizes {get;set;}
	public boolean showRequirements {get;set;}
	public boolean showReqColumn {get;set;}
    
    public void setEvents(String lst) {
        System.debug('Set events');
        
        events = new Set<Id>();
        
        List<String> st = lst.split(',');
        for (String s : st)
           events.add(s);
        
    }
    
    public void updateEvents() {
    }
    
    public void dummy() {
    System.debug('DUMMY FUNCTION');
    }
    
    public Id getTemplateId() {
    System.debug('GETTEMPLATEID');
        return templateId ;
    }
    
    public void setTemplateId(String templateId) {
    System.debug('SETTEMPLATEID');
        this.templateId = templateId;
    }
    
    public IncentiveBuilderClass() {
        incentive = new Incentive();
        getIncentiveFormats();
    }
    
    public void setDisplayVariables() {
        Incentive__c i = incentive.getRecord();
        // Prize section
        if (i.Type__c == 'Points Tiered') {
			showRequirements = false ;
			showReqColumn = true;
        } else if (i.Type__c == 'Position') {
			showRequirements = false ;
			showReqColumn = false ;
        } else if (i.Type__c == 'Stack Up') {
			showRequirements = true ;
			showReqColumn = true ;
        } else if (i.Type__c == 'Multi-criteria') {
			showRequirements = true ;
			showReqColumn = true;
        } else {
			showRequirements = true ;
			showReqColumn = true;
        }
        
        // Events Section
        List<IncentiveRule__c> r = incentive.getRules(); 
        
        showTarget = false; 
        showPointsTarget = false ;
        showPointsMultiplier = false ;
        showPointsValue = false;
        showPointsField = false;  
        showEvents = false; 
        
        for (IncentiveRule__c rule: r) {
            
            showEvents = true ;
           
            if (rule.PointsMultiplier__c != null && rule.PointsMultiplier__c > 0) {
                showPointsMultiplier = true;
            }
            if (rule.PointsValue__c != null && rule.PointsValue__c > 0) {
                showPointsValue = true;
            }
            if (rule.PointsField__c != null && rule.PointsField__c != '') {
                showPointsField = true;
            }
			
        }
		
    }
    
   /* public void selectEvent() {
        
        List<IncentiveRule__c> events = getSystemRules() ;
        
        for (IncentiveRule__c event: events) {
            if (event.Title__c == rule.Title__c) {
                // TODO make this more intelligent by looping through fields. implemented in clone function
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
    }*/
    
    /*public void toggleType() {
        ApexPages.Message myMsg = new ApexPages.Message(ApexPages.Severity.ERROR,'Error: Invalid Input.');
        if (rule.Type__c != null && rule.Type__c =='Update') {
                typeUpdate = true ;
        } else {
            typeUpdate = false ;
        }
    }*/
    
    public Incentive__c getIncentive() {
          if(incentive == null) incentive = new Incentive();
          return incentive.getRecord();
    }
    
    public Incentive getIncentiveObj() {
          if(incentive == null) incentive = new Incentive();
          return incentive;
    }
    
    public IncentiveRule__c getRule() {
          if(rule == null) rule = new IncentiveRule__c();
          return rule;
    }
    
    public List<IncentiveRule__c> getRules() {
        if (templateId == null || templateId == '') {
            return new List<IncentiveRule__c>();
        } else {
            return incentive.getRules();
        }
    }
    
    
    public void removeRule() {
        Id ruleId = ApexPages.currentPage().getParameters().get('ruleId');
        
        incentive.removeRule(ruleId) ;
    }
    
    public void removePrize() {
        Id prizeId = ApexPages.currentPage().getParameters().get('prizeId');
        
        incentive.removePrize(prizeId);
    }
    
    public static List<SelectOption> getNumericFields(String currObj)   
    {  
        List<SelectOption> fields = new List<SelectOption>();
        fields.add(new SelectOption('-- None --', '-- None --')); 
      
        Schema.SObjectType sobjType = gd.get(currObj);  
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
    
    public static List<SelectOption> getSobjectFields(String currObj)   
    {  
        List<SelectOption> fields = new List<SelectOption>();
        fields.add(new SelectOption('-- None --', '-- None --')); 
      
        Schema.SObjectType sobjType = gd.get(currObj);  
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
    
    public List<SelectOption> getEvents()
    {
       List<IncentiveEvent__c> events = [select Title__c, Object__c from IncentiveEvent__c];
       List<SelectOption> options = new List<SelectOption>();
       
       options.add(new SelectOption('-- Select --', '-- Select --'));
       
       for(IncentiveEvent__c event : events)
       {
           options.add(new SelectOption(event.Title__c, event.Title__c));
       }
       options.sort();
       return options;
      
    }
    
    public static List<IncentiveRule__c> getSystemRules() {
        List<Incentive__c> incentive = [select Id, Title__c from Incentive__c where Name in ('SYSTEM', 'FORMAT')];
        List<IncentiveRule__c> events = new List<IncentiveRule__c>(); 
        
        if (incentive != null && incentive.size() > 0) events = CalculateMetrics.getRules(incentive[0].Id);
    
        return events ;
    }
    
    public List<incentive__c> getIncentiveFormats() {
        List<Incentive__c> formats = new List<Incentive__c>([select Id, Title__c, Description__c, Type__c from Incentive__c where Name = 'FORMAT']);
       
        return formats ;
    }
   
    
    public Map<Id, Incentive> getFormats() {
        
        if (templates == null) {
            templates = new Map<Id, Incentive>();
            List<Incentive__c> systemIncentives = new List<Incentive__c>([select Id, Name, Title__c, Type__c from Incentive__c where Name = 'FORMAT']);
            
            for (Incentive__c systemIncentive: systemIncentives) {
                Incentive i = new Incentive(systemIncentive) ;
                templates.put(systemIncentive.Id, i);
            }
        }
        
        return templates ;
    }
    
    public class ObjEvent {
        
        public String obj {get;set;}
        List<IncentiveEvent__c> events ;
        List<SelectOption> objPointFields ;
        
        public ObjEvent(String objectName) {
            this.obj = objectName ;
            events = new List<IncentiveEvent__c>();
            objPointFields = getNumericFields(objectName);
        }
        
        public List<IncentiveEvent__c> getEvents() {
            return events ;
        }
        
        public List<SelectOption> getObjPointFields() {
            return objPointFields;
        }
        
        public void addEvent(IncentiveEvent__c event) {
            this.events.add(event);
        }
    }
    
    public List<ObjEvent> getEventObjs()
    {
       List<IncentiveEvent__c> events = [select Title__c, Object__c from IncentiveEvent__c];
       Map<String, ObjEvent> objEvents = new Map<String, ObjEvent>() ;
       
       for(IncentiveEvent__c event : events)
       {
           if (event.Title__c != null && event.Title__c != '') {
               
              ObjEvent objEvent ;
              if (objEvents.containsKey(event.Object__c )) {
                 objEvent = objEvents.get(event.Object__c);
              } else {
                 objEvent = new ObjEvent(event.Object__c);
                 objEvents.put(event.Object__c, objEvent);
              }
              objEvent.addEvent(event) ;
           }
       }
       return objEvents.values();
      
    }
    
    public List<SelectOption> getRuleCountTypes()
    {
      List<SelectOption> options = new List<SelectOption>();
        
       Schema.DescribeFieldResult fieldResult =
       IncentiveRule__c.CountType__c.getDescribe();
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
    
    // called by basic details back button
    public PageReference step0() {
    
      return Page.InvFormatSelector;
    }
    
    // Called by format selector -> basic details
    public PageReference step1() {
          
        Incentive template = getFormats().get(templateId);
        
        incentive.clone(template) ;
        
        setDisplayVariables() ;
        
        return Page.InvBasicDetails;
    }
    
    // Called by basic details -> event selector
    public PageReference step2() {
    
      return Page.InvEventSelector;
    }
    
    public PageReference step3() {
    
      return Page.InvPrizeSelector;
    }
 
   public PageReference step4() {
       
       System.debug('STEP 4');
       
      // TODO figure out how to do this properly
      List<User> ids = new List<User>([select Id from User where ProfileId in ('00ei00000013M1P','00ei00000013M1b','00ei00000013M1M','00ei00000013M1bAAE') and Id != :UserInfo.getUserId()]) ;
      
      if (incentive.getRecord().ChatterGroupTitle__c != null && incentive.getRecord().ChatterGroupTitle__c != '') {
        Id groupId = IncentiveBuilderClass.createGroup(incentive.getRecord().ChatterGroupTitle__c, ids);
        incentive.getRecord().ChatterGroupId__c = groupId ;
      }
      
      incentive.save() ;
      save(incentive.getRecord().Id, JSON.serializePretty(incentive.getRecord()));
      PageReference pageRef = Page.InvAdmin;
      
      return pageRef.setRedirect(true);
   }
 
    @future (callout=true)
    public static void save(Id incentiveId, String body) {
        
        System.debug('Save');
    
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