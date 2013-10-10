public class IncentiveBuilderClass {
    
    String subdomain ;
    String startDate ;
    String endDate ;
    String title ;
    String tagline ;
    String description ;
    
    public String getSubdomain(){
        return subdomain;
    }
    
    public void setSubdomain(String nd){
        this.subdomain = nd;
    }
    
    public String getTitle(){
        return title;
    }
    
    public void setTitle(String nd){
        this.title = nd;
    }
    
    public String getTagline(){
        return tagline;
    }
    
    public void setTagline(String nd){
        this.tagline = nd;
    }
    
    public String getDescription(){
        return description;
    }
    
    public void setDescription(String nd){
        this.description = nd;
    }
    
     public String getStartDate(){
        return startDate;
    }
    
    public void setStartDate(String nd){
        this.startDate = nd;
    }
    
     public String getEndDate(){
        return endDate;
    }
    
    public void setEndDate(String nd){
        this.endDate = nd;
    }
    
    public PageReference buildSite() {
    
        HttpRequest req = new HttpRequest();
        System.debug('Start date:'+startDate);
        System.debug('End date:'+endDate);
        
        String body = 'subdomain='+subdomain+
			'&active=false'+
            '&startDate='+EncodingUtil.urlEncode(startDate,'UTF-8')+
            '&endDate='+EncodingUtil.urlEncode(endDate,'UTF-8')+
            '&title='+EncodingUtil.urlEncode(title,'UTF-8')+
            '&tagline='+EncodingUtil.urlEncode(tagline,'UTF-8')+
            '&description='+EncodingUtil.urlEncode(description,'UTF-8');
            
        System.debug(body) ;
         
        //Set HTTPRequest Method
        req.setMethod('POST');

        //Set HTTPRequest header properties
        req.setHeader('content-type', 'application/x-www-form-urlencoded');
        //req.setHeader('Host','data.invtr.co');
        req.setEndpoint('https://data.invtr.co/incentivebuilder');
        req.setHeader('Connection','keep-alive');

        //Set the HTTPRequest body  
        req.setBody(body);   

        Http http = new Http();
        
        PageReference pageRef = Page.InvSiteConfig;
        pageRef.setRedirect(true);
  
        try {
 
            //Execute web service call here    
            HTTPResponse res = http.send(req);  

            //Helpful debug messages
            System.debug(res.toString());
            System.debug('STATUS:'+res.getStatus());
            System.debug('STATUS_CODE:'+res.getStatusCode());
            
            if (res.getStatusCode() != 200) {
                
                String msg = 'code:'+res.getStatusCode()+' reason:'+res.getStatus() ;
                ApexPages.Message myMsg = new ApexPages.Message(ApexPages.Severity.FATAL, msg);
                
                ApexPages.addMessage(myMsg);
                pageRef = ApexPages.CurrentPage();
            }
    
        } catch(System.CalloutException e) {
            System.debug(e);
            ApexPages.addMessages(e);
            pageRef = ApexPages.CurrentPage();
        }
          
        storeIncentive() ;
        
        return pageRef;
    }
    
    public void storeIncentive() {
    
        try {
            Incentive__c newIncentive = new Incentive__c() ;
            newIncentive.Name = subdomain ;
			newIncentive.Active__c = false ;
            newIncentive.StartDate__c = Datetime.parse(startDate) ;
            newIncentive.EndDate__c =Datetime.parse(endDate) ;
            newIncentive.Title__c = title;
            newIncentive.Tagline__c = tagline;
            newIncentive.Description__c = description ;
            newIncentive.Url__c = 'https://'+subdomain+'.invtr.co';
        
            insert newIncentive ;
        } catch (DMLException e){
            System.debug(e);
        }

    }
}