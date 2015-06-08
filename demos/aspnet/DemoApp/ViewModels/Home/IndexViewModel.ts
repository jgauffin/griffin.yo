/// <reference path="../../../../../source/Griffin.Yo.ts"/> 

module DemoApp.Home {
    import Yo = Griffin.Yo;

    export class IndexViewModel implements Yo.IViewModel {
        public getTitle(): string {
            return 'Home page';
        }

        public activate(context: Yo.IActivationContext): void {
            context.render({ Name: 'Hello index' });
            context.resolve();
        }

        public deactivate() {

        }
    }
}