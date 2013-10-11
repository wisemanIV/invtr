@isTest
private class UpdateIncentivesSchedulerTestClass {
    
    static testMethod void testInitIncentives() {
        // Set mock callout class 
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
        
        UpdateIncentivesSchedule schedule = new UpdateIncentivesSchedule();
        
        Incentive__c newIncentive = buildIncentive('unittest10');
        
        buildOpportunity() ;
        
        List<Incentive__c> a = [Select Name from Incentive__c where Name = :newIncentive.Name and SnapshotTaken__c = false ];
        System.assertEquals(a.size(), 1, 'Expected 1 unprocessed incentive');
        
        schedule.initIncentives();
        
        List<Incentive__c> b = [Select Name from Incentive__c where SnapshotTaken__c = false];
        System.assertEquals(b.size(), 0, 'Expecting all incentives to be processed');
        
        List<Incentive__c> d = [Select Name from Incentive__c where SnapshotTaken__c = true];
        System.assertEquals(d.size(), 1, 'Expecting 1 processed incentive');
        
        Opportunity opp = buildOpportunity() ;
        
        schedule.initIncentives();
        
        List<IncentiveRecord__c> c = [Select Name, NewOppCount__c, OwnerId__c from IncentiveRecord__c where IncentiveIdentifier__c = :newIncentive.Name and OwnerId__c = :opp.OwnerId];
        System.assertEquals(c.size(), 1, 'Expecting 1 incentive record');
        System.assertEquals(c[0].NewOppCount__c, 1, 'Expecting 1 new opp');
        
        User user = [select Id from User where Id = :c[0].OwnerId__c];
        
        System.assertEquals(user.Id, c[0].OwnerId__c, 'Expecting lookup by ownerid to work');
    }
    
    static testMethod void testSetBaseline() {
        UpdateIncentivesSchedule schedule = new UpdateIncentivesSchedule();
        
        Incentive__c newIncentive = buildIncentive('unittest12');
        
        schedule.setBaselineMetrics(newIncentive) ;
        
        List<User> users = [select Id from User] ;
        
        List<IncentiveRecord__c> irecs = [select Id, OwnerId__c from IncentiveRecord__c where IncentiveIdentifier__c = :newIncentive.Name];
            
        System.assertEquals(users.size(), irecs.size(), 'Expecting 1 incentive record per user');
        
        User user = [select Id from User where Id = :irecs[0].OwnerId__c];
        
        System.assertEquals(user.Id, irecs[0].OwnerId__c, 'Expecting lookup by ownerid to work');
        
        
    }
    
    
    static testMethod void testCreateSnapshot() {
    
        UpdateIncentivesSchedule schedule = new UpdateIncentivesSchedule();
        
        Incentive__c newIncentive = buildIncentive('unittest12');
        
        schedule.createSnapshot(newIncentive, Datetime.now());
        
        List<Incentive__c> a = [Select Name, SnapshotTaken__c from Incentive__c where Name = 'unittest12' ];
        
        System.assertEquals(a.size(), 1, 'Expecting 1 incentive');
        System.assertEquals(a[0].SnapshotTaken__c, true, 'Expecting incentive to be processed');
    
    }
    
    static testMethod void testGetSnapshot() {
        UpdateIncentivesSchedule schedule = new UpdateIncentivesSchedule();
        
        Incentive__c newIncentive = buildIncentive('unittest16');
        
        buildOpportunity();
        
        List<Opportunity> a = new List<Opportunity>([Select Id from Opportunity ]);
       
        buildSnapshotOpp(newIncentive.Id, a.get(0).Id);
        
        Map<ID, OpportunitySnapshot__c> snapshot = schedule.getSnapshotOpportunities(newIncentive.Id);
        
        System.assertEquals(snapshot.size(), 1, 'Expecting 1 snapshot opportunity');
        Set<id> oppIds = snapshot.keySet() ;
        List<id> l=new List<id>();
        l.addAll(oppIds);
        
        System.assertEquals(oppIds.size(), 1, 'Expecting 1 snapshot key');
        System.assertEquals(l.get(0), a.get(0).Id, 'Expecting snapshot key to equal orig');

        System.assertEquals(snapshot.get(a.get(0).Id).ExpectedRevenue__c, 1000, 'Expecting snapshot opp rev 1000');
    }
    
    static testMethod void testRecalc() {
    
        UpdateIncentivesSchedule schedule = new UpdateIncentivesSchedule();
        
        Incentive__c newIncentive = buildIncentive('unittest14');
        schedule.setBaselineMetrics(newIncentive);
        
        Opportunity opp = buildOpportunity();
        
        schedule.recalc(newIncentive, schedule.getCurrOpportunities(), schedule.getSnapshotOpportunities(newIncentive.Id));
        
        List<IncentiveRecord__c> c = new List<IncentiveRecord__c>([Select Name from IncentiveRecord__c where OwnerId__c = :opp.OwnerId]);
        System.assertEquals(c.size(), 1, 'Expecting 1 incentive record');
    
    }
    
    static testMethod void testWinRecalc() {
    
        UpdateIncentivesSchedule schedule = new UpdateIncentivesSchedule();
        
        Incentive__c newIncentive = buildIncentive('unittest14');
        schedule.setBaselineMetrics(newIncentive);
        
        Opportunity opp = buildOpportunity();
        
        schedule.recalc(newIncentive, schedule.getCurrOpportunities(), schedule.getSnapshotOpportunities(newIncentive.Id));
        
        opp.Amount = 3400 ;
        opp.StageName='Closed Won';
        update opp ;
        
        schedule.recalc(newIncentive, schedule.getCurrOpportunities(), schedule.getSnapshotOpportunities(newIncentive.Id));
        
        List<IncentiveRecord__c> c = new List<IncentiveRecord__c>([Select Name, OwnerId__c, WonCount__c, WonAmount__c from IncentiveRecord__c where OwnerId__C = :opp.OwnerId]);
        System.assertEquals(c.size(), 1, 'Expecting 1 incentive record');
        System.assertEquals(c[0].WonCount__c, 1, 'Expecting won count 1');
        System.assertEquals(c[0].WonAmount__c, 3400, 'Expecting won count 1');
        
        User user = [select Id from User where Id = :c[0].OwnerId__c];
        
        System.assertEquals(user.Id, c[0].OwnerId__c, 'Expecting lookup by ownerid to work');
    
    }
    
    static testMethod void testGetIncentiveRecords() {
        UpdateIncentivesSchedule schedule = new UpdateIncentivesSchedule();
        
        Incentive__c newIncentive = buildIncentive('unittest14');
        schedule.setBaselineMetrics(newIncentive);
        Map<ID, IncentiveRecord__c> irecs = schedule.getIncentiveRecords(newIncentive.Name);
        
        List<User> users = [SELECT Id from User];
        
        IncentiveRecord__c ir = irecs.get(users[0].Id);
        
        System.assertEquals(ir.OwnerId__c, users[0].Id, 'Map result not what was expected');
        
    }
    
    private static Opportunity buildOpportunity() {
    
        List<User> d = [Select Id from User];
    
        Opportunity opp = new Opportunity();
        opp.Name = 'testopp';
        opp.StageName = 'Won';
        opp.CloseDate = Date.parse('09/10/2013');
        opp.OwnerId = d[0].Id ;
        insert opp ;
        
        return opp ;
    }
    
    private static Incentive__c buildIncentive(String incentiveName) {
    
        Incentive__c newIncentive = new Incentive__c() ;
        newIncentive.Name = incentiveName ;
        newIncentive.StartDate__c = Datetime.parse('09/01/2013 10:00 AM') ;
        newIncentive.EndDate__c =Datetime.parse('09/01/2020 10:00 AM') ;
        newIncentive.Title__c = 'title';
        newIncentive.Tagline__c = 'tagline';
        newIncentive.Description__c = 'description' ;
        newIncentive.Url__c = 'https://unittest10.invtr.co';
        newIncentive.SnapshotTaken__c = false ;
   
        insert newIncentive ; 
        
        return newIncentive ;   
    
    
    }
    
    private static OpportunitySnapshot__c buildSnapshotOpp(Id incentiveId, Id oppId) {
        OpportunitySnapshot__c snapOpp = new OpportunitySnapshot__c() ;
        snapOpp.ExpectedRevenue__c = 1000 ;
        snapOpp.IsWon__c = false ;
        snapOpp.OpportunityId__c = oppId ;
        snapOpp.IncentiveId__c = incentiveId;
        insert snapOpp ;
        
        return snapOpp ;
    
    }
    
    
    
}