modulo.register('cpart', class DesignUtil {
    constructedCallback() {
        const { ColorTranslator, Harmony, Mix } = modulo.registry.utils.colortranslator;
        function color (s, arg) {
            // TOOD: Maybe things like: |brightness:"140%"? Or a shorthand:
            // |hsl:"+10,+30,-10" (hue saturation lightness) Basically: A CSS-like unit
            // that's a "color-delta"
            // TODO: http://www.easyrgb.com/en/math.php
        }


        // Converts CSS in the format of [ [ "some-key", "some-value" ] ] into (or in
        // the format of { "some-key": "some-value" }) into "--some-key: some-value;"
        // (Two-dash prefixed CSS variables, joined by newlines)
        function cssvars(arr, indentCount) {
            arr = Array.isArray(arr) ? arr : Object.toEntries(arr);
            const indent = String(' ').repeat(Number(indentCount || 0));
            const vars = arr.map(([ key, value ]) => `--${ key }: ${ value };`);
            const sep = indent + "\n";
            return indent + vars.join(sep);
        }

        function fgcolor(s) {
            //const color = new ColorTranslator(s);
        }

        this.modulo.register('templateFilter', cssvars);
        this.modulo.register('templateFilter', color);
        this.modulo.register('templateFilter', fgcolor);
    }

    setupArray(arr) {
        arr.removeAt = index => {
            this.modulo.assert((index > -1) && (index < arr.length),
                'DesignUtil "removeAt" array method - Index out of bounds');
            console.log('this is removeAt', index, 1);
            arr.splice(index, 1);
            console.log('this is ar', arr);
        };
        arr.remove = val => {
            const index = arr.indexOf(val);
            this.modulo.assert(index !== -1,
                'DesignUtil "remove" array method - Could not find value');
            arr.removeAt(index);
        };
        arr.toggle = val => {
            return arr.includes(val) ? arr.remove(val) : arr.push(val);
        };
    }

    teardownArray(arr) {
        const methods = [ 'removeAt', 'remove', 'toggle' ];
        for (const methodName of methods) {
            if (methodName in arr) {
                delete arr[methodName]; // Remove all references to methods, now that it's bound
            }
        }
    }

    _patchState(methodName) {
        const state = this.element.cparts.state;
        if (state && state.data) {
            for (const value of Object.values(state.data)) {
                if (Array.isArray(value)) {
                    this[methodName + 'Array'](value);
                }
            }
        }
    }

    domCallback() {
        this._patchState('setup'); // Attach events (so any @click:= binds work)
    }

    updateCallback() {
        // Strip events to prevent them from showing in loops, and to save
        // memory and have less side-effects, etc
        this._patchState('teardown');
    }

}, { Type: 'DesignUtil' });
