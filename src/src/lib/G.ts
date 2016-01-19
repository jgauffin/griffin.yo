/// <reference path="Dom.ts"/>
/// <reference path="Views.ts"/>

module Griffin.Yo {
    /**
     * Global mappings
     */
    export class G {
        static select = new Dom.Selector();
        static handle = new Dom.EventMapper();

        static render(idOrElem: any, dto: any, directives?: any) {
            const r = new Views.ViewRenderer(idOrElem);
            r.render(dto, directives);
        }
    }    
}
