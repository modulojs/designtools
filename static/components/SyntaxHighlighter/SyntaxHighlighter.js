
function initializedCallback() {
    const text = props.value || element.originalHTML;
    //console.log('inititalized callback!', text.length, text.substr(0, 20));
    let { mode } = props;

    if (!mode || !mode.includes('_')) {
        return; // Normal mode, return and ignore the rest
    }

    // Messy code to deal with "upgrading" self into a <x-DemoEditor>
    // This is only used in Markdown, e.g. "```modulo_demo" fenced blocks
    let [ modeName, editor, extra ] = mode.split('_');
    mode = modeName;
    // Clean up to prevent double encoding:
    let valueAttr = text.replace(/&gt;/gi, '>').replace(/&lt;/gi, '<');
    valueAttr = valueAttr.replace(new RegExp('(\\W)/(script)>', 'ig'), '$1</$2>');
    const e = document.createElement('x-DemoEditor');

    // If this has an example also set, then add that
    let exampleAttr = null;
    let componentName = null;
    if (extra) {
        if (extra === 'example' || extra === 'examplefirst') {
            const split1 = valueAttr.split(new RegExp('\\s*<!--\\s*%%+\\s*'));
            const split2 = split1[1].split(new RegExp('\\s*%%+\\s*-->\\s*'));
            valueAttr = split1[0];
            componentName = split2[0];
            exampleAttr = split2[1];
            if (!exampleAttr) { // only using this syntax to specify component name
                exampleAttr = `<x-${ componentName }></x-${ componentName }>`;
            }
        }
    }

    e.setAttribute('value', valueAttr);
    e.setAttribute('class', element.getAttribute('class')); // copy class attr
    if (extra) {
        if (exampleAttr) { // Set example attribute with this one
            e.setAttribute('example', exampleAttr);
        }
        if (componentName) { // Set example attribute with this one
            e.setAttribute('component', componentName);
        }
        if (extra === 'examplefirst') { // Should show the example first
            e.setAttribute('editex', 'true');
        }
    }
    element.replaceWith(e);
    element.wasReplaced = true; // prevent update from being called
}

function updateCallback(renderObj) {
    if (element.wasReplaced) {
        return;
    }
    /*
    if (element.hasAttribute('modulo-original-html')) {
        element.removeAttribute('modulo-original-html');
        return; // lock if original HTML was set
    }
    */
    let text = props.value || element.originalHTML;
    // Undo exceccive HTML encoding
    if (props.fix === 'html_encoding') {
        text = text
          .replace(/&gt;/gi, '>')
          .replace(/&lt;/gi, '<');
        text = text.replace(new RegExp('(\\W)/(script)>', 'ig'), '$1</$2>');
    }
    // Should never have to encounter a '-'...
    const language = props.mode ? props.mode.split('_')[0] : 'django';
    const opts = { language };
    //const { hljs } = modulo.registry.utils;
    //let html = hljs.highlight(text, opts).value;
    const { syntaxHighlight } = modulo.registry.utils;

    // Add in colors for Modulo tag names / attributes
    let html = syntaxHighlight(text, opts);
    html = html.replace(/"hljs-name">([A-Z])/g, '"hljs-modulo-deftype">$1');
    html = html.replace(/"hljs-attr">([A-Z])/g, '"hljs-modulo-deftype-attr">$1');
    html = html.replace(/"hljs-name">([a-z]+-[A-Z])/g, '"hljs-modulo-component-tag">$1');
    html = html.replace(/"hljs-string">(true|false|null)/g, '"hljs-modulo-attr-value-lit">$1');
    html = html.replace(/"hljs-string">([A-Za-z])/g, '"hljs-modulo-attr-value">$1');
    html = html.replace(/"hljs-string">([0-9\[\{])/g, '"hljs-modulo-attr-value-lit">$1');
    element.innerHTML = html
}

