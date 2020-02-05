class MasterContact {
    static serialize(payload){

        return {
            canbefixed__c: payload.CanBeFixed,
            canbechanged__c: payload.canBeChanged

        }
    }
}

module.exports = MasterContact;
