//aka cheating closure.
var BasicApp = BasicApp || {};
BasicApp.Users = BasicApp.Users || {};
BasicApp.Users.IndexViewModel = (function () {
    function IndexViewModel() {
    }
    IndexViewModel.prototype.getTitle = function () {
        return 'Userlist';
    };
    
    // the context keeps everything scoped
    // to within the element (i.e. section of the main view)
    // that is the target for this view model.
    //
    // thus the VM only needs to know how to render information
    // and not where.
    IndexViewModel.prototype.activate = function (context) {
        
        //Data is rendered into view 
        //before it's appended to the document
        context.render({ Name: 'Listing users' });
        
        //resolve = model ready to be rendered.
        context.resolve();
    }
    
    IndexViewModel.prototype.deactivate = function () {
    };
    return IndexViewModel;
})();
