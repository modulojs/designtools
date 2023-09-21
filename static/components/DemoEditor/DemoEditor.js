const EDITOR_LOCATION = '/static/demos/editor.html'
const LOCAL_STORAGE_PREFIX = 'mdufs-';
const { toEmbed } = modulo.registry.cparts.ModuloDemo; // Retrieve helper funcs
const { saveFileAs } = modulo.registry.utils;

function editorMount({ el }) {
    element.editor = el;
}

function exampleMount({ el }) {
    element.exampleEditor = el;
}

function _updateState() {
    if (element.editor) {
        state.value = element.editor.value;
    }
    if (props.value && !state.value) {
        state.value = props.value;
    }
    if (element.hasAttribute('modulo-value') && !state.value) {
        state.value = element.getAttribute('modulo-value');
    }
    if (state.showExample === null) {
        state.showExample = !!props.editex; // Default to if it's an "example editor"
    }
    state.showEditor = !props.collapsed;
    state.componentName = getComponentName();
    if (element.exampleEditor) { // Use user-supplied example code
        state.exampleCode = element.exampleEditor.value;
    }
    if (!state.exampleCode) { // Init with props if available
        state.exampleCode = props.example || `<x-${ state.componentName }></x-${ state.componentName }>`;
    }
}

function prepareCallback() {
    _updateState();
    const e = element; // TODO: Refactor
    if (props.src && !state.value && state.isFetching === null) {
        state.isFetching = true;
        window.fetch(props.src)
            .then(response => response.text())
            .then(text => {
                e.cparts.state.data.value = text;
                e.cparts.state.data.isFetching = false;
                e.setAttribute('modulo-value', text);
                e.cparts.state.propagate('value', text);
            });
    }
}

function getComponentName(src = false) {
    if (props.component) { // takes precedence
        return props.component;
    }
    src = src || props.src;
    if (src) {
        return src.split('/').pop().split('.').shift();
    } else {
        return 'App';
    }
}

function toggleMenu() {
    state.showMenu = !state.showMenu;
}

function run() {
    // TODO: Issue with hydrating, need to figure out, but in built version need this:
    element.editor = element.editor || element.querySelector('x-SyntaxEditor') || null;
    _updateState(); // Will auto-rerender, which will also auto run if changed
}

function save() {
    // Saves as HTML
    _updateState();
    const fullText = toEmbed(state.value, state.componentName, state.exampleCode);
    saveFileAs(`Modulo_${ state.componentName }.html`, fullText);
}

function open() {
    // Opens in ACE editor
    _updateState();
    const fullText = toEmbed(state.value, state.componentName, state.exampleCode);
    const path =`/demo/${ state.componentName }.html`
    localStorage.setItem(LOCAL_STORAGE_PREFIX + path, fullText);
    window.location.href = (EDITOR_LOCATION + '?ls=' + path);
}

