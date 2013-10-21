global class PostInstallClass implements InstallHandler {
    
  global void onInstall(InstallContext context) {
    if(context.previousVersion() == null) {
        
        CalculateMetrics updater = new CalculateMetrics();
        String sch='0 0 * * * ?';
        String jobID = system.schedule('Update incentives job 00', sch, updater);     
        sch='0 5 * * * ?';
        jobID = system.schedule('Update incentives job 05', sch, updater);  
        sch='0 10 * * * ?';
        jobID = system.schedule('Update incentives job 10', sch, updater);  
        sch='0 15 * * * ?';
        jobID = system.schedule('Update incentives job 15', sch, updater);  
        sch='0 20 * * * ?';
        jobID = system.schedule('Update incentives job 20', sch, updater);  
        sch='0 25 * * * ?';
        jobID = system.schedule('Update incentives job 25', sch, updater);  
        sch='0 30 * * * ?';
        jobID = system.schedule('Update incentives job 30', sch, updater);  
        sch='0 35 * * * ?';
        jobID = system.schedule('Update incentives job 35', sch, updater);  
        sch='0 40 * * * ?';
        jobID = system.schedule('Update incentives job 40', sch, updater);  
        sch='0 45 * * * ?';
        jobID = system.schedule('Update incentives job 45', sch, updater);  
        sch='0 50 * * * ?';
        jobID = system.schedule('Update incentives job 50', sch, updater);  
        sch='0 55 * * * ?';
        jobID = system.schedule('Update incentives job 55', sch, updater);
        
        pushData(context.organizationId(), context.installerId()) ;
    }
  }
    
  public void pushData(ID orgId, ID installerId) {
      
    System.debug('pushData: orgId:'+orgId+' installerId:'+installerId);
        
    HttpRequest req = new HttpRequest();
    
    String body = 'orgId='+EncodingUtil.urlEncode(orgId,'UTF-8')+
            '&installerId='+EncodingUtil.urlEncode(installerId,'UTF-8');
         
        //Set HTTPRequest Method
        req.setMethod('POST');

        //Set HTTPRequest header properties
        req.setHeader('content-type', 'application/x-www-form-urlencoded');
        req.setEndpoint('https://data.invtr.co/installhandler');
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
                System.debug(msg);
            }
        
        } catch(System.CalloutException e) {
            System.debug(e);
        }
    }
    
    public static void setupInitialEvents() {
		
		List<IncentiveRule__c> rules = IncentiveBuilderClass.getSystemRules() ;
		if (rules != null && rules.size() > 0) delete rules; 
		List<Incentive__c> incentives = new List<Incentive__c>([select Id from Incentive__c where Name='SYSTEM']);
		if (incentives != null && incentives.size() > 0)  delete incentives ;
		
        Incentive__c incentive = new Incentive__c() ;
        incentive.Name = 'SYSTEM';
        incentive.StartDate__c = Datetime.parse('09/01/2001 10:00 AM') ;
        incentive.EndDate__c =Datetime.parse('09/01/2022 10:00 AM') ;
        insert incentive ;
        
        IncentiveRule__c rule = new IncentiveRule__c() ;
        rule.Title__c = 'New opportunities';
		rule.DisplayLabel__c = 'New Opportunity';
		rule.DisplayFormat__c = '';
		rule.DisplayPointsFieldFormat__c = '$';
		rule.DisplayPointsFieldLabel__c = 'New Opp Revenue';
		rule.PointsFieldTarget__c = '100000';
        rule.Object__c = 'Opportunity';
        rule.Type__c = 'New';
        rule.PointsField__c = 'Amount';
        rule.IncentiveId__c = incentive.Id;
		rule.UserIdField__c = 'OwnerId';
        
        insert rule ;
        
        rule = new IncentiveRule__c() ;
        rule.Title__c = 'Opportunities won';
		rule.DisplayLabel__c = 'Opportunity Won';
		rule.DisplayFormat__c = '$';
		rule.DisplayPointsFieldFormat__c = '$';
		rule.DisplayPointsFieldLabel__c = 'Booked Revenue';
		rule.PointsFieldTarget__c = '100000';
        rule.Object__c = 'Opportunity';
        rule.Type__c = 'Update';
		rule.Field__c = 'StageName';
        rule.StartValue__c = 'Any';
        rule.EndValue__c = 'Closed Won';
        rule.PointsField__c = 'Amount' ;
        rule.IncentiveId__c = incentive.Id;
		rule.UserIdField__c = 'OwnerId';
		
		insert rule;
		
        rule = new IncentiveRule__c() ;
        rule.Title__c = 'Accounts opened';
		rule.DisplayLabel__c = 'Accounts Opened';
		rule.DisplayFormat__c = '';
        rule.Object__c = 'Account';
        rule.Type__c = 'New';
        rule.PointsValue__c = 200 ;
        rule.IncentiveId__c = incentive.Id;
		
		insert rule;
		
        rule = new IncentiveRule__c() ;
        rule.Title__c = 'Cases Closed';
		rule.DisplayLabel__c = 'Cases Closed';
        rule.Object__c = 'Case';
		rule.DisplayFormat__c = '';
        rule.Type__c = 'Update';
		rule.Field__c = 'Status';
        rule.PointsValue__c = 200 ;
        rule.IncentiveId__c = incentive.Id;
		
		insert rule;
		
        rule = new IncentiveRule__c() ;
        rule.Title__c = 'Leads Generated';
		rule.DisplayLabel__c = 'Leads Generated';
		rule.DisplayFormat__c = '';
        rule.Object__c = 'Lead';
        rule.Type__c = 'New';
        rule.PointsValue__c = 200 ;
        rule.IncentiveId__c = incentive.Id;
        
        insert rule;
    }
}