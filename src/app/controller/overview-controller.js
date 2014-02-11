
module.exports = function($scope, TicklerWatch, Configuration) {
    TicklerWatch.update();
    $scope.OfflineUsage=Configuration.local.get("OfflineUsage");
    
    $scope.updateOfflineUsage = function() {
        Configuration.local.put("OfflineUsage", $scope.OfflineUsage);
    };
    
    
};

module.exports.$inject = ['$scope', 'TicklerWatch', 'Configuration'];