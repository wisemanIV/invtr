global class UpdateIncentivesSchedule implements Schedulable {
   global void execute(SchedulableContext SC) {
      initIncentives(); 
   }
    
   public void initIncentives() {
       
       List<Incentive__c> preInitIncentives = [select Name, StartDate__c, EndDate__c, SnapshotTaken__c from Incentive__c];
 
       datetime d = datetime.now();
       
        //Loop through all records in the Trigger.new collection
        for(Incentive__c a: preInitIncentives){
            // generate initial snapshot
            if (a.StartDate__c.getTime() < d.getTime() && a.SnapshotTaken__c==false) {
                createSnapshot(a, d);
				setBaselineMetrics(a);
            } else {
                // recalc metrics
                if (a.StartDate__c.getTime() < d.getTime() && a.EndDate__c.getTime() > d.getTime() && a.SnapshotTaken__c==true) {
                    recalc(a, getCurrOpportunities(), getSnapshotOpportunities(a.Id)) ;
                }
            }
        }
        
   }
    
   public void createSnapshot(Incentive__c incentive, datetime s) {
	   
	   System.debug('createSnapshot');
             
       List<Opportunity> currOpportunities = [select Id, Amount, CloseDate, ExpectedRevenue, IsClosed, IsWon, OwnerId, Probability, StageName FROM Opportunity];
 
       for(Opportunity a: currOpportunities){
           OpportunitySnapshot__c os = new OpportunitySnapshot__c() ;
           
           os.Name = incentive.Name ;
		   os.IncentiveId__c = incentive.Id ;
           os.OpportunityId__c = a.Id ;
           os.OwnerId__c = a.OwnerId ;
           os.ExpectedRevenue__c = a.ExpectedRevenue ;
           os.Amount__c = a.Amount ;
           os.IsWon__c = a.IsWon ;
           os.CloseDate__c = a.CloseDate ;
           os.Probability__c = a.Probability ;
           os.StageName__c = a.StageName ;
           
           insert os ;
           
       }
       
       incentive.SnapshotTaken__c = true ;
       incentive.SnapshotDate__c = s ;
	   incentive.Active__c = true ;
       update incentive; 
       
   }
   
   public List<Opportunity> getCurrOpportunities() {
       return new List<Opportunity>([select Id, Amount, CloseDate, ExpectedRevenue, IsClosed, IsWon, OwnerId, Probability, StageName FROM Opportunity]);
       
   }
   
   public Map<Id, OpportunitySnapshot__c> getSnapshotOpportunities(Id incentiveId) {
       List<OpportunitySnapshot__c> snapL = new List<OpportunitySnapshot__c>([select OpportunityId__c, Amount__c, CloseDate__c, ExpectedRevenue__c, IsWon__c, OwnerId__c, Probability__c, StageName__c FROM OpportunitySnapshot__c where IncentiveId__c = :incentiveId]);
       
       Map<Id, OpportunitySnapshot__c> snapshot = new Map<Id, OpportunitySnapshot__c>();
        
       for(OpportunitySnapshot__c a: snapL){
           snapshot.put(a.OpportunityId__c, a);
       }
       
       return snapshot ;
       
   }
    
   public void recalc(Incentive__c incentive, List<Opportunity> currOpportunities, Map<Id, OpportunitySnapshot__c> snapshotOpportunities ) {
          
		 
       Map<ID, IncentiveRecord__c> metrics = getIncentiveRecords(incentive.Name);
	   
       //Loop through all records in the Trigger.new collection
        for(Opportunity a: currOpportunities){
            
            OpportunitySnapShot__c snapshotOpp = null;
            if (snapshotOpportunities != null && snapshotOpportunities.size() > 0) {
               snapshotOpp = snapshotOpportunities.get(a.Id) ;
            }
            
            // is it a new opportunity 
            if (snapshotOpp==null) {
				
				Decimal expectedRev = 0;
				if (a.ExpectedRevenue!=null) {
					expectedRev = a.ExpectedRevenue;
				}
				
                if (!metrics.containsKey(a.OwnerId)) {
                    metrics.put(a.OwnerId, newMetric(incentive.Name, a.OwnerId, 1, expectedRev, 0, 0.0, 100)) ;
                } else {
                    IncentiveRecord__c metric = metrics.get(a.OwnerId);
                    metric.NewOppCount__c += 1 ;
                    metric.NewOppRev__c += expectedRev ;
                    metric.Points__c += 100 ;
                    metrics.put(a.OwnerId, metric);
                }
            } 
            // if new and won since start or existed and won during incentive
            if ((snapshotOpp==null && a.StageName=='Closed Won') || (snapshotOpp != null && snapshotOpp.StageName__c!='Closed Won' && a.StageName=='Closed Won')) {
				Decimal amount = 0;
				if (a.Amount!=null) {
					amount = a.Amount;
				}
				
				if (!metrics.containsKey(a.OwnerId)) {
                    metrics.put(a.OwnerId, newMetric(incentive.Name, a.OwnerId, 0, 0.0, 1, amount, 100)) ;
                } else {
                    IncentiveRecord__c metric = metrics.get(a.OwnerId);
                    metric.WonCount__c += 1 ;
                    metric.WonAmount__c += amount ;
                    metrics.put(a.OwnerId, metric);
                }
            }
        }
        
        storeMetrics(incentive.Name, metrics.values());
        
   }
   
   public void storeMetrics(String incentiveIdentifier, List<IncentiveRecord__c> recs) {
		
        update recs ;
   }
   
   public void setBaselineMetrics(Incentive__c incentive) {
	  
	   //cleanup previous records 
      List<IncentiveRecord__c> oldirecs = [SELECT Id FROM IncentiveRecord__c where IncentiveIdentifier__c = :incentive.Name];
      delete oldirecs ;
	  
 	  List<User> users = [SELECT Id FROM User];
	  List<IncentiveRecord__c> irecs = new List<IncentiveRecord__c>();
	  
	  for(User u: users) {
	
	  	irecs.add(newMetric(incentive.Name, u.Id, 0, 0, 0, 0, 0));
	 
		
	 }
	 insert irecs;
   }
   
   public Map<Id, IncentiveRecord__c> getIncentiveRecords(String incentiveIdentifier) {
	   
       List<IncentiveRecord__c> irecs = [SELECT Id, OwnerId, NewOppCount__c, NewOppRev__c, WonCount__c, WonAmount__c, Points__c FROM IncentiveRecord__c where IncentiveIdentifier__c = :incentiveIdentifier];
       Map<ID, IncentiveRecord__c> metrics = new Map<ID, IncentiveRecord__c>();
	   
	   for(IncentiveRecord__c rec: irecs) {
		   metrics.put(rec.OwnerId, rec);
	   }
      
       return metrics ;
   }
	   
                        
   public IncentiveRecord__c newMetric(String incentiveIdentifier, Id userId, Integer oppCount, Decimal oppRev, Integer wonCount, Decimal wonRev, Integer points) {
              
	  User user = [SELECT Id, FirstName, LastName, AccountId, SmallPhotoUrl, FullPhotoUrl, Username, City, State, Country FROM User where Id = :userId];
		          
      IncentiveRecord__c metric = new IncentiveRecord__c() ;
	  metric.IncentiveIdentifier__c = incentiveIdentifier;
	  metric.OwnerId = userId ;
	  metric.FirstName__c = user.FirstName ;
      metric.LastName__c = user.LastName ;
	  metric.SmallPhotoUrl__c = user.SmallPhotoUrl;
	  metric.FullPhotoUrl__c = user.FullPhotoUrl;
      metric.NewOppCount__c = oppCount ;
      metric.NewOppRev__c = oppRev ;
      metric.WonCount__c = wonCount ; 
      metric.WonAmount__c = wonRev ; 
      metric.Points__c = points ; 
      return metric ;
   }
        
}