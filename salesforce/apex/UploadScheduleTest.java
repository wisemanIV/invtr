@isTest
private class UploadScheduleTestClass {
    
    static testMethod void testUpdateMetrics() {
		
        // Set mock callout class 
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
        
        UploadSchedule schedule = new UploadSchedule();
		
		schedule.updateMetrics();
		
	}
	
    static testMethod void testUpdateIncentives() {
		
        // Set mock callout class 
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
        
        UploadSchedule schedule = new UploadSchedule();
		
		schedule.updateIncentives();
		
	}
	
    static testMethod void testUpdateRules() {
		
        // Set mock callout class 
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
        
        UploadSchedule schedule = new UploadSchedule();
		
		schedule.updateRules();
		
	}
	
    static testMethod void testUpdateUsers() {
		
        // Set mock callout class 
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
        
        UploadSchedule schedule = new UploadSchedule();
		
		schedule.updateUsers();
		
	}
	
}