/// <reference path="../../../../../source/Griffin.Yo.ts"/> 

module DemoApp.Users {
    import Yo = Griffin.Yo;

    export class DetailsViewModel implements Yo.IViewModel {
        public getTitle(): string {
            return 'User details';
        }

        public activate(context: Yo.IActivationContext): void {
            Yo.Http.get('/user/' + context.routeData['id'], xhr => {
                context.render(xhr.responseBody);
                context.resolve();
            });
        }

        public deactivate() {

        }
    }    
}
