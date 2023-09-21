modulo.config.modulodemo = {
    Directives: [ 'demoMount', 'demoUnmount' ],
    component: 'props.name',
    value: 'props.value',
};


modulo.registry.cparts.ModuloDemo = class ModuloDemo {
    static toEmbed(codeText, componentName, usage = '') {
        const name = componentName || 'App';
        if (!usage) {
            usage = `\n\n<!-- Example usage: -->\n<x-${name}></x-${name}>`;
        }
        const indentText = ('\n' + codeText.trim()).replace(/\n/g, '\n    ');
        const fullText = `<!DOCTYPE html>\n<template Modulo>\n` +
                          `  <Component name="${ name }">` + indentText + '\n' +
                          '  </Component>\n' +
                          '</template>\n' +
                          '<script src="https://unpkg.com/mdu.js"></script>\n' +
                          usage;
        return fullText;
    }

    demoMount({ el }) {
        this.demoElement = el;
        this.demoElement.innerHTML = ''; // Ensure blanked
    }

    demoUnmount() {
        this.demoElement = null;
    }

    domCallback(renderObj) {
        if (this.demoElement) { // When the demo is appearing, prevent this component from updating DOM
            renderObj.component.innerHTML = null;
            renderObj.component.innerDOM = null;
        }
    }

    updateCallback(renderObj) {
        if (!this.demoElement) {
            return; // No demo element
        }
        if (this.demoElement.offsetParent === null) {
            // TODO: Change to auto-run only in view, to save CPU
            return; // Demo element is not visible, let's not try to render
        }
        this.value = this.modulo.registry.utils.get(renderObj, this.conf.value);
        this.componentName = this.modulo.registry.utils.get(renderObj, this.conf.component) || 'App';
        //console.log('this is component name', this.componentName, renderObj.props.component);
        this.example = this.modulo.registry.utils.get(renderObj, this.conf.example);
        this.checkForRun();
    }

    checkForRun() {
        if (typeof this.value === 'undefined') {
            return; // don't have a value assigned yet, skip
        }
        if (!this.demoElement.innerHTML || this._lastValue !== this.value || this._lastExample !== this.example) {
            // Blank, or changed (either value or example): Record values to detect changes & run
            this._lastValue = this.value;
            this._lastExample = this.example;
            this.run().then(componentUseExample => { // Update demo element with HTML
                this.demoElement.innerHTML = componentUseExample;
            });
        }
    }

    nextId() {
        // Use a window-attached demo ID, since we want it to be globally
        // unique (e.g. for the namespace to never collide)
        if (!window._moduloDemoID || window._moduloDemoID < 1000) { // Always reset to 1000 
            window._moduloDemoID = 1000;
        }
        return ++window._moduloDemoID; // assign next modulo ID
    }

    getComponentUseExample(ns) {
        const tagName = ns + '-' + this.componentName;
        const placeholder = 'x-' + this.componentName;

        // For now, this only is used for a single substitution. But if there
        // are multiple components being defined, then it could be used for
        // multiple definitions:
        const includesNameMap = {
            [ placeholder.toUpperCase() ]: tagName,
        };

        // Do all necessary substitutions
        const tags = Object.keys(includesNameMap).join('|').toLowerCase();
        const regexp = new RegExp('<(\\s*/?\\s*)(' + tags + ')([^a-zA-Z-])', 'ig');
        let text = this.example || `<${ placeholder }></${ placeholder }>`;
        text = text.replace(regexp, (match, m1, m2, m3) => {
            const newTag = includesNameMap[m2.toUpperCase()]; // </x-TagName to
            return `<${ m1 }${ newTag }${ m3 }`; // </demo123-TagName
        });
        return text;
    }

    run() {
        const ns = 'd' + this.nextId();
        const definitionCode = `<Component namespace="${ ns }" name="${ this.componentName }"` +
                                ` mode="shadow">\n${ this.value }\n</Component>`;
        const componentUseExample = this.getComponentUseExample(ns);
        const runCode = (resolve, reject) => {
            // Load under _component prefix, only allowing component defs
            try {
                window.modulo.loadString(definitionCode, '_component');
                window.modulo.preprocessAndDefine(() => {
                    // Delete all '_component' prefix main requires, so they
                    // don't get included in any builds
                    modulo.assets.mainRequires = modulo.assets.mainRequires
                        .filter(name => !name.startsWith('_component'));
                    resolve(componentUseExample);
                });
            } catch (error) {
                console.error('DEMO ERROR: loadString failed');
                console.log('DEMO ERROR: Could not load definition');
                console.log('---------------------------');
                console.log(error);
                reject(error);
            }
        };
        return new window.Promise(runCode);
    }
}

modulo.register('cpart', modulo.registry.cparts.ModuloDemo);
