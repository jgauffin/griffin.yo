# griffin.yo

An easy SPA library written in TypeScript. Either use it as a complete SPA framework, or use any of the classes directly (view render, router, view model handler, http client).

***Got no dependenies, not even on jQuery***

Supports:

* Complex/Nested DTOs (data from server side)
* Complex views
* Caching (scripts/views are cached once fetched)
* Caching of server side data (using standard HTTP headers)
* Spa routing


## Main page (layout)

```html
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>Demo</title>
</head>
    <body>
        <div id="YoView">
        </div>
        <div class="navigation">
            <a href="#users/1">Show user</a>
            <a href="#/">Index</a>
        </div>
        <script src="Yo.js" type="text/javascript"></script>
        <script type="text/javascript">
            var spa = new Griffin.Yo.Spa('AppName');
            spa.mapRoute('', 'home/index');
            spa.mapRoute('user/:id', 'users/details');
            spa.mapRoute('users/', 'users/list');
            spa.run();
        </script>
    </body>
</html>
```

## View

```html
<div id="DetailsView">
    <h1 data-name="Name"></h1>
    <table>
        <tbody>
            <tr data-name="Users">
                <td data-name="Id"></td>
                <td data-name="UserName"></td>
            </tr>

        </tbody>
    </table>
    <div data-name="Address">
        <div data-name="Attention"></div>
        <div data-name="Postal">
            <span data-name="ZipCode"></span>
            <span data-name="City"></span>
        </div>
    </div>
</div>
```

## View model

```c#
/// <reference path="../../Yo.ts"/> 

module AppName.Users {
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
```


*There are more documentation in the wiki*
