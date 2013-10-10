@isTest
private class UploadScheduleTestClass {
    
    static testMethod void testInitIncentives() {
		
        // Set mock callout class 
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
        
        UploadSchedule schedule = new UploadSchedule();
		
		schedule.updateMetrics();
		
	}
	
}