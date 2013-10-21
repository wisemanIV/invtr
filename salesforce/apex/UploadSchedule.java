global class UploadSchedule implements Schedulable {
   global void execute(SchedulableContext SC) {
      updateIncentives();
      updateMetrics(); 
	  updateLeaders(); 
      updateRules(); 
      updateUsers();
   }
   
   public void updateIncentives() {
       
       System.debug('updateIncentive');
       
       List<Incentive__c> incentive = [SELECT Id, Name, Active__c, StartDate__c, EndDate__c, Title__c, Tagline__c, Description__c, Url__c, BackgroundImageUrl__c FROM Incentive__c];
    
       String recsJSON = JSON.serializePretty(incentive);
       
       System.debug(recsJSON);
       
       transmitData(recsJSON, '/incentive') ;
       
   }
   
   public void updateMetrics() {
       
       System.debug('updateMetrics');
       
       List<Incentive__c> incentives = ProcessIncentives.getActiveIncentives();
       
       Map<String, List<IncentiveRecord__c>> incentiveRecords = new Map<String, List<IncentiveRecord__c>>() ;
       
       for (Incentive__c incentive : incentives) {
       
           List<IncentiveRecord__c> recs = [SELECT IncentiveIdentifier__c, OwnerId__c, FullPhotoUrl__c, SmallPhotoUrl__c, FirstName__c, LastName__c, RuleId__c, Count__c, Points__c FROM IncentiveRecord__c where IncentiveIdentifier__c = :incentive.Name];
           
           incentiveRecords.put(incentive.Name, recs);
       }
       
       String recsJSON = JSON.serializePretty(incentiveRecords);
   
       System.debug(recsJSON);
   
       transmitData(recsJSON, '/salesforce') ;
        
   }
   
   public void updateLeaders() {
       
       System.debug('updateLeaders');
       
       List<Incentive__c> incentives = ProcessIncentives.getActiveIncentives();
       
       Map<String, List<IncentiveSummary__c>> incentiveSummaries = new Map<String, List<IncentiveSummary__c>>() ;
       
       for (Incentive__c incentive : incentives) {
       
           List<IncentiveSummary__c> summaries = [SELECT IncentiveIdentifier__c, FirstName__c, LastName__c, SmallPhotoUrl__c, FullPhotoUrl__c, OwnerId__c, PointsTotal__c FROM IncentiveSummary__c where IncentiveIdentifier__c = :incentive.Name];
           
           incentiveSummaries.put(incentive.Name, summaries);
       }
       
       String recsJSON = JSON.serializePretty(incentiveSummaries);
   
       System.debug(recsJSON);
   
       transmitData(recsJSON, '/leader') ;
        
   }
   
   public void updateRules() {
       
       System.debug('updateRules');
       
       List<Incentive__c> incentives = ProcessIncentives.getActiveIncentives();
       
       Map<String, List<IncentiveRule__c>> incentiveRules = new Map<String, List<IncentiveRule__c>>() ;
           
       for (Incentive__c incentive : incentives) {
       
            List<IncentiveRule__c> rules = CalculateMetrics.getRules(incentive.Id);
            
            incentiveRules.put(incentive.Name, rules);
       }        
       
       String recsJSON = JSON.serializePretty(incentiveRules);
       
       System.debug(recsJSON);
       
       transmitData(recsJSON, '/rule') ;
       
   }
   
   public void updateUsers() {
       
       System.debug('updateUsers');
       
       List<User> recs = [SELECT Id, FirstName, LastName, AccountId, SmallPhotoUrl, FullPhotoUrl, Username, City, State, Country FROM User];
    
       String recsJSON = JSON.serializePretty(recs);
       
       System.debug(recsJSON);
       
       transmitData(recsJSON, '/user') ;
        
   }
   
   public boolean transmitData(String body, String target) {
       
       HttpRequest req = new HttpRequest();
         
       //Set HTTPRequest Method
       req.setMethod('POST');

       //Set HTTPRequest header properties
       req.setHeader('content-type', 'application/json');
       req.setEndpoint('https://data.invtr.co'+target);
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
                return false ;
            }
            
            return true ;
        
        } catch(System.CalloutException e) {
            System.debug(e);
            
            return false; 
        }

   
   }
        
}