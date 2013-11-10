global class PostInstallClass implements InstallHandler {
    
  global void onInstall(InstallContext context) {
    if(context.previousVersion() == null) {
        
     /*   CalculateMetrics updater = new CalculateMetrics();
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
        
        pushData(context.organizationId(), context.installerId()) ;*/
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
    
    private static Map<String, IncentiveEvent__c> events = new Map<String, IncentiveEvent__c>();
    
    public static void buildInitialConfig() {
        setupEvents();
        setupIncentives();
    }
    
    public static void setupEvents() {
        
        IncentiveEvent__c event = new IncentiveEvent__c();
        event = buildEvent('Accounts Opened', 'Account', 'New', null, null, null, 'OwnerId') ;
        events.put('Accounts Opened', event);
        // TODO set start and end value
        event = buildEvent('Cases Closed', 'Case', 'Update', 'Status', null, null, 'OwnerId') ;
        events.put('Cases Closed', event);
        event = buildEvent('Leads Generated', 'Lead', 'New', null, null, null, 'OwnerId') ;
        events.put('Leads Generated', event);
        event = buildEvent('New Opportunity', 'Opportunity', 'New', null, null, null, 'OwnerId'); 
        events.put('New Opportunity', event);
        event = buildEvent('Opportunity Won', 'Opportunity', 'Update', 'StageName', 'Any', 'Closed Won', 'OwnerId') ;
        events.put('Opportunity Won', event);
        
    }
    
    public static IncentiveEvent__c buildEvent(String title, String objName, String type, String field, String startValue, String endValue, String userIdField) {
        
        IncentiveEvent__c event = new IncentiveEvent__c() ;
        event.Title__c = title;
        event.Object__c = objName;
        event.Type__c = type;
        event.Field__c = field;
        event.StartValue__c = startValue;
        event.EndValue__c = endValue;
        event.UserIdField__c = userIdField;
        
        insert event;
        
        return event ;
        
    }
    
    public static void setupIncentives() {
        
        List<IncentiveRule__c> rules = IncentiveBuilderClass.getSystemRules() ;
        if (rules != null && rules.size() > 0) delete rules; 
        List<Incentive__c> incentives = new List<Incentive__c>([select Id from Incentive__c where Name in ('SYSTEM','FORMAT')]);
        if (incentives != null && incentives.size() > 0)  delete incentives ;
        
        
        // INCENTIVE Sales - tiered opportunity builder
        
        Incentive__c oppi = new Incentive__c() ;
        oppi.Name = 'FORMAT';
        oppi.Type__c = 'Points Tiered';
        oppi.Title__c = 'Presidents Club';
        oppi.Description__c = 'A long running tiered incentive format. Success is based on new opportunities created and opportunities won. Entrants will receive 1/2 point per Expected $ Revenue on new opportunities and 1 point per Actual Revenue on opportunities closed. All activity must take place during the incentive window. Everybody who achevies the points level for a tier will receive the prize associated with that tier.';
        oppi.StartDate__c = Datetime.parse('09/01/2001 10:00 AM') ;
        oppi.EndDate__c =Datetime.parse('09/01/2022 10:00 AM') ;
        insert oppi ;
        
        IncentiveRule__c rule = new IncentiveRule__c() ;
        rule.IncentiveEventId__c = events.get('New Opportunity').Id ;
        rule.Title__c = 'New Opportunity';
        rule.DisplayFormat__c = '';
        rule.DisplayPointsFieldFormat__c = '$';
        rule.DisplayPointsFieldLabel__c = 'New Opp Revenue';
        rule.PointsField__c = 'Expected Amount';
        rule.PointsMultiplier__c = 0.5;
        rule.IncentiveId__c = oppi.Id;
        rule.Target__c = 0;
        insert rule ;
        
        rule = new IncentiveRule__c() ;
        rule.IncentiveEventId__c = events.get('Opportunity Won').Id ;
        rule.Title__c = 'Opportunity Won';
        rule.DisplayFormat__c = '$';
        rule.DisplayPointsFieldFormat__c = '$';
        rule.DisplayPointsFieldLabel__c = 'Booked Revenue';
        rule.PointsField__c = 'Amount' ;
        rule.PointsMultiplier__c = 1;
        rule.IncentiveId__c = oppi.Id;
        rule.Target__c = 0;
        insert rule;
        
        buildPrize('$10 Starbucks Gift Certificate', oppi.Id, 1, 1000, 'http://www.invtr.co/img/prizes/starbucks-gift-card.png');
        buildPrize('Dinner for 2 at Gary Dankos', oppi.Id, 1, 5000, 'http://www.invtr.co/img/prizes/gary_danko.jpg');
        buildPrize('Trip to Mexico', oppi.Id, 1, 20000, 'http://www.invtr.co/img/prizes/mexico-trip.jpg');
        
        // END - Sales - tiered opportunity builder
        
        // INCENTIVE Sales - top in sales
        
        oppi = new Incentive__c() ;
        oppi.Name = 'FORMAT';
        oppi.Type__c = 'Position';
        oppi.Title__c = 'King of the Leaderboard';
        oppi.Description__c = 'This incentive rewards the entrant with the highest number of points at the end of the period. The runner up will also receive a prize. Entrants earn 1/2 point per Expected $ Revenue on new opportunities and 1 point per Actual Revenue on closed opportunities.';
        oppi.StartDate__c = Datetime.parse('09/01/2001 10:00 AM') ;
        oppi.EndDate__c =Datetime.parse('09/01/2022 10:00 AM') ;
        insert oppi ;
        
        rule = new IncentiveRule__c() ;
        rule.IncentiveEventId__c = events.get('New Opportunity').Id ;
        rule.Title__c = 'New Opportunity';
        rule.DisplayFormat__c = '';
        rule.DisplayPointsFieldFormat__c = '$';
        rule.DisplayPointsFieldLabel__c = 'New Opp Revenue';
        rule.PointsField__c = 'Expected Amount';
        rule.PointsMultiplier__c = 0.5;
        rule.IncentiveId__c = oppi.Id;
        rule.Target__c = 0;
        insert rule ;
        
        rule = new IncentiveRule__c() ;
        rule.IncentiveEventId__c = events.get('Opportunity Won').Id ;
        rule.Title__c = 'Opportunity Won';
        rule.DisplayFormat__c = '$';
        rule.DisplayPointsFieldFormat__c = '$';
        rule.DisplayPointsFieldLabel__c = 'Booked Revenue';
        rule.PointsField__c = 'Amount' ;
        rule.PointsMultiplier__c = 1;
        rule.IncentiveId__c = oppi.Id;
        rule.Target__c = 0 ;
        insert rule;
        
        buildPrize('21in iMac screen', oppi.Id, 1, null, 'http://www.invtr.co/img/prizes/apple-imac.jpg');
        buildPrize('$10 Starbucks Gift Certificate', oppi.Id, 2, null, 'http://www.invtr.co/img/prizes/starbucks-gift-card.png');
        
        // END - Sales - points winner
        
        // INCENTIVE Sales - stack up your rewards
        
        Incentive__c oppis = new Incentive__c() ;
        oppis.Name = 'FORMAT';
        oppis.Type__c = 'Stack Up';
        oppis.Title__c = 'Stack Up Your Rewards';
        oppis.Description__c = 'Entrants will receive the prize for every $20k in booked revenue from closed opportunities. All activity must take place during the incentive period.';
        oppis.StartDate__c = Datetime.parse('09/01/2001 10:00 AM') ;
        oppis.EndDate__c =Datetime.parse('09/01/2022 10:00 AM') ;
        insert oppis ;
        
        rule = new IncentiveRule__c() ;
        rule.IncentiveEventId__c = events.get('Opportunity Won').Id ;
        rule.Title__c = 'Opportunity Won';
        rule.DisplayFormat__c = '$';
        rule.DisplayPointsFieldFormat__c = '$';
        rule.DisplayPointsFieldLabel__c = 'Booked Revenue';
        rule.CountType__c = 'Points';
        rule.Target__c = 20000 ;
        rule.PointsMultiplier__c = 1;
        rule.IncentiveId__c = oppis.Id;
        insert rule;
        
        buildPrize('$100 Cash Bonus', oppis.Id, null, null, 'http://www.invtr.co/img/prizes/cash100.jpeg');
        
        // END - Sales - stack up your rewards
        
        // INCENTIVE Sales - multi criteria
        
        oppi = new Incentive__c() ;
        oppi.Name = 'FORMAT';
        oppi.Type__c = 'Multi-criteria';
        oppi.Title__c = 'Rocking the Business';
        oppi.Description__c = 'Winners must enter a minimum of 5 new opportunities and book $40k in revenue from closed opportunities during the incentive period. To receive the next prize winners must book 5 new opportunities and acheive total sales of $50k';
        oppi.StartDate__c = Datetime.parse('09/01/2001 10:00 AM') ;
        oppi.EndDate__c =Datetime.parse('09/01/2022 10:00 AM') ;
        insert oppi ;
        
        rule = new IncentiveRule__c() ;
        rule.IncentiveEventId__c = events.get('New Opportunity').Id ;
        rule.Title__c = 'New Opportunity';
        rule.DisplayFormat__c = '';
        rule.DisplayPointsFieldFormat__c = '$';
        rule.DisplayPointsFieldLabel__c = 'New Opp Revenue';
        rule.PointsField__c = 'Expected Amount';
        rule.IncentiveId__c = oppi.Id;
        rule.CountType__c = 'Count';
        rule.Target__c = 5 ;
        insert rule ;
        
        rule = new IncentiveRule__c() ;
        rule.IncentiveEventId__c = events.get('Opportunity Won').Id ;
        rule.Title__c = 'Opportunity Won';
        rule.DisplayFormat__c = '$';
        rule.DisplayPointsFieldFormat__c = '$';
        rule.DisplayPointsFieldLabel__c = 'Booked Revenue';
        rule.PointsField__c = 'Amount' ;
        rule.IncentiveId__c = oppi.Id;
        rule.CountType__c = 'Points';
        rule.Target__c = 40000 ; 
        insert rule;
        
        buildPrize('21in iMac Screen', oppi.Id, null, null, 'http://www.invtr.co/img/prizes/apple-imac.jpg');
        buildPrize('2 flights to New York', oppi.Id, null, null, 'http://www.invtr.co/img/prizes/newyork.jpeg');
       
        
        // END - Sales - multi criteria
        
       
    }
    
    public static void buildPrize(String title, Id incentiveId, Integer pos, Integer level, String url) {
        IncentivePrize__c tier = new IncentivePrize__c();
        tier.Prize__c = title;
        tier.IncentiveId__c = incentiveId;
        tier.Position__c = pos ;
        tier.Level__c = level ;
		tier.ImageUrl__c = url ;
        insert tier;
        
    }
}