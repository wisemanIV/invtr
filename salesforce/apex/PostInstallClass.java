global class PostInstallClass implements InstallHandler {
    
  global void onInstall(InstallContext context) {
    if(context.previousVersion() == null) {
    	
		UpdateIncentivesSchedule updater = new UpdateIncentivesSchedule();
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
}