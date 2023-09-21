
modulo.register('cpart', class DesignUtil {
    constructedCallback() {
        /******* FILTERS ********/
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

        this.modulo.register('templateFilter', cssvars);
        this.modulo.register('templateFilter', color);
    }


}, { Type: 'DesignUtil' });
