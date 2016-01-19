/// <reference path="Dom.ts"/>

module Griffin.Yo.Spa.ViewModels {
    import Dom = Yo.Dom;

    export class ClassFactory {
        //credits: http://stackoverflow.com/a/2441972/70386
        public static getConstructor(appName: string, viewModelModuleAndName: string): any {
            const nameParts = viewModelModuleAndName.split(".");
            let fn: any = ((<any>window)[appName] || (<any>this)[appName]);
            if (typeof fn === "undefined") {
                throw new Error(`Failed to load application namespace "${appName}". Have a view model been loaded successfully?`);
            }
            for (var i = 0, len = nameParts.length; i < len; i++) {
                if (fn.hasOwnProperty(nameParts[i])) {
                    fn = fn[nameParts[i]];
                    continue;
                }
                const name = nameParts[i].toLowerCase();
                let foundName: string;
                for (let propertyName in fn) {
                    if (!fn.hasOwnProperty(propertyName)) {
                        continue;
                    }
                    if (propertyName.toLowerCase() === name) {
                        foundName = propertyName;
                    }
                }


                if (typeof foundName === "undefined")
                    throw new Error(`Could not find "${nameParts[i]}" from viewModel name, complete name: "${appName}.${viewModelModuleAndName}".`);

                fn = fn[foundName];
            }

            if (typeof fn !== "function") {
                throw new Error(`Could not find view model ${viewModelModuleAndName}`);
            }
            return fn;
        }
    }

    /**
  * Context used when a view model is activated.
  * Do note that the VM MUST invoke either resolve or reject once all data have been loaded. No rendering
  * will take place unless so.
  */
    export interface IActivationContext {
        /**
         * Information resolved from the route mapping.
         * For instance if the route is 'user/:userId' then this will be the object '{ userId: 10 }'.
         */
        routeData: any;

        /**
         * Element that the view is being rendered into. It has not been attached to the document yet.
         */
        viewContainer: HTMLElement;

        /**
         * Should be used to populate the view with information
         * @param data data to populate the view with
         * @param directives directives that adopts the data to fit the view.
         */
        render(data: any, directives?: any): void;

        /**
         * Render partial view
         * @param viewSelector Id/Selector for the part to update
         * @param data data to populate the part with
         * @param directives directives that adopts the data to fit the view.
         */
        renderPartial(viewSelector: string, data: any, directives?: any): void;

        /**
         * Read a form from your view
         * @param viewSelector Either a "data-name"/"id" or a HTMLElement that contains the form to read
         * @return A JSON object
         */
        readForm(viewSelector: string | HTMLElement): any;

        /**
         * Used to identify elements in the view
         */
        select: Dom.Selector;

        /**
         * Used to subscribe on events in the view.
         */
        handle: Dom.EventMapper;

        /**
         * View model has been initialized OK, View can be loaded.
         */
        resolve(): void;

        /**
         * View model failed to load OK
         */
        reject(): void;

        /**
         * Application wide scope (used to store application specific data). Defined in GlobalConfig.
         */
        applicationScope: any;
    }

    /**
 * A view model (controlling what is presented in a view and also acts on events)
 */
    export interface IViewModel {
        /**
         * Document title
         * Will be invoked after activate as been run
         */
        getTitle(): string;

        /**
         * This viewModel just became active.
         */
        activate(context: IActivationContext): void;

        /**
         * User is navigating away from this view model.
         */
        deactivate(): void;
    }

    /**
 * Implement if you would like to control how view models are created.
 * The script containing the view model have been loaded before this interface
 * is being called.
 */
    export interface IViewModelFactory {
        create(applicationName: string, fullViewModelName: string): IViewModel;
    }

}
