
module.exports = function($scope, TicklerWatch, pouchdb) {
    $scope.pendingTicklers=TicklerWatch.pendingTicklers;
    $scope.obj= pouchdb.replicating();
    $scope.startReplication=pouchdb.startReplication;
    $scope.stopReplication=pouchdb.stopReplication;
    TicklerWatch.update();
    //pouchdb.startReplication();
};

module.exports.$inject = ['$scope', 'TicklerWatch', 'pouchdb'];