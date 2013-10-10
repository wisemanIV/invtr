@isTest
private class IncentiveBuilderTestClass {

    static testMethod void testStoreIncentive() {
    
        IncentiveBuilderClass incentiveBuilder = new IncentiveBuilderClass();
        incentiveBuilder.setSubdomain('unittest1');
        incentiveBuilder.setStartDate('2013-09-30 15:00:01');
        incentiveBuilder.setEndDate('2013-10-30 15:00:01');
        incentiveBuilder.setTitle('test title');
        incentiveBuilder.setTagline('test tagline');
        incentiveBuilder.setDescription('test description');
        
        incentiveBuilder.storeIncentive();
        
        List<Incentive__c> newIncentive = [SELECT Url__c, StartDate__c, EndDate__c, Name FROM Incentive__c WHERE Name='unittest1']; 
        
        System.assertEquals(newIncentive.size(), 1, 'Expected 1 new incentive');
    
        
    }
    
    static testMethod void testBuildSite() {
        // Set mock callout class 
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
        
        IncentiveBuilderClass incentiveBuilder = new IncentiveBuilderClass();
        incentiveBuilder.setSubdomain('unittest');
        System.assertEquals(incentiveBuilder.getSubdomain(), 'unittest', 'subdomain mismatch');
        
        incentiveBuilder.setStartDate('2013-09-30 15:00:01');
        System.assertEquals(incentiveBuilder.getStartDate(), '2013-09-30 15:00:01', 'start date mismatch');
       
       
        incentiveBuilder.setEndDate('2013-10-30 15:00:01');
        System.assertEquals(incentiveBuilder.getEndDate(), '2013-10-30 15:00:01', 'end date mismatch');
        
        incentiveBuilder.setTitle('test title');
        System.assertEquals(incentiveBuilder.getTitle(), 'test title', 'title mismatch');
        
        
        incentiveBuilder.setTagline('test tagline');
        System.assertEquals(incentiveBuilder.getTagline(), 'test tagline', 'tagline mismatch');
       
        incentiveBuilder.setDescription('test description');
        System.assertEquals(incentiveBuilder.getDescription(), 'test description', 'description mismatch');
       
       
        PageReference pageRef = incentiveBuilder.buildSite() ;
        
        System.assertEquals(pageRef.getUrl(), '/apex/inviter__invsiteconfig', 'Expected success page');
    }
    
}