@isTest
private class IncentiveBuilderTestClass {
    
    static testMethod void testSetDisplayVariables() {
        
        IncentiveBuilderClass incentiveBuilder = new IncentiveBuilderClass();
        
        Incentive__c rec = new Incentive__c();
        insert rec ;
        IncentiveRule__c rule = new IncentiveRule__c();
        rule.PointsField__c = 'Test';
        rule.IncentiveId__c = rec.Id ;
        insert rule;
        
        Incentive template = new Incentive(rec);
        Incentive incentive = new Incentive();
        
        incentive.clone(template) ;
        
        List<IncentiveRule__c> rules = incentive.getRules();
        
        System.assertEquals(rules.size(), 1, 'Expected 1 rule');
        
        System.assertEquals(rules[0].PointsField__c, 'Test', 'Expected points field test');
        
        
        System.assertEquals(incentiveBuilder.showPointsField, null, 'Expected show points field false');
        
        incentiveBuilder.setDisplayVariables() ;
        
        System.assertEquals(incentiveBuilder.showPointsField, true, 'Expected show points field true');
    
    }
    
    static testMethod void testStep1() {
        
        IncentiveBuilderClass incentiveBuilder = new IncentiveBuilderClass();
        
        Incentive template = TestHelpers.getIncentive();
        
        incentiveBuilder.setTemplateId(template.getRecord().Id);
        
        incentiveBuilder.step1() ;
        
        Incentive incentive = incentiveBuilder.getIncentiveObj();
        
        System.assertEquals(incentive.getPrizes(), template.getPrizes(), 'Expected incentive to have same prizes as template');
        
    }
    
    static testMethod void testGetFormats() {
        
        IncentiveBuilderClass incentiveBuilder = new IncentiveBuilderClass();
        
        Incentive template = TestHelpers.getIncentive();
        
        Map<Id, Incentive> formats = incentiveBuilder.getFormats();
        
        Incentive test = formats.get(template.getRecord().Id);
        
        System.assertEquals(test.getRecord().Name, template.getRecord().Name, 'Expected same name');
        System.assertEquals(test.getRules().size(), template.getRules().size(), 'Expected same number of rules');
        System.assertEquals(test.getPrizes().size(), template.getPrizes().size(), 'Expected same number of prizes');
    
        
        
    }

  
    
}
