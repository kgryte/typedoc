"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NavigationBuilder = exports.DefaultTheme = void 0;
const Path = require("path");
const FS = require("fs");
const theme_1 = require("../theme");
const index_1 = require("../../models/reflections/index");
const UrlMapping_1 = require("../models/UrlMapping");
const NavigationItem_1 = require("../models/NavigationItem");
const events_1 = require("../events");
class DefaultTheme extends theme_1.Theme {
    constructor(renderer, basePath) {
        super(renderer, basePath);
        this.listenTo(renderer, events_1.RendererEvent.BEGIN, this.onRendererBegin, 1024);
    }
    isOutputDirectory(path) {
        if (!FS.existsSync(Path.join(path, 'index.html'))) {
            return false;
        }
        if (!FS.existsSync(Path.join(path, 'assets'))) {
            return false;
        }
        if (!FS.existsSync(Path.join(path, 'assets', 'js', 'main.js'))) {
            return false;
        }
        if (!FS.existsSync(Path.join(path, 'assets', 'images', 'icons.png'))) {
            return false;
        }
        return true;
    }
    getUrls(project) {
        const urls = [];
        const entryPoint = this.getEntryPoint(project);
        if (this.application.options.getValue('readme') === 'none') {
            entryPoint.url = 'index.html';
            urls.push(new UrlMapping_1.UrlMapping('index.html', entryPoint, 'reflection.hbs'));
        }
        else {
            entryPoint.url = 'globals.html';
            urls.push(new UrlMapping_1.UrlMapping('globals.html', entryPoint, 'reflection.hbs'));
            urls.push(new UrlMapping_1.UrlMapping('index.html', project, 'index.hbs'));
        }
        if (entryPoint.children) {
            entryPoint.children.forEach((child) => {
                if (child instanceof index_1.DeclarationReflection) {
                    DefaultTheme.buildUrls(child, urls);
                }
            });
        }
        return urls;
    }
    getEntryPoint(project) {
        const entryPoint = this.owner.entryPoint;
        if (entryPoint) {
            const reflection = project.getChildByName(entryPoint);
            if (reflection) {
                if (reflection instanceof index_1.ContainerReflection) {
                    return reflection;
                }
                else {
                    this.application.logger.warn('The given entry point `%s` is not a container.', entryPoint);
                }
            }
            else {
                this.application.logger.warn('The entry point `%s` could not be found.', entryPoint);
            }
        }
        return project;
    }
    getNavigation(project) {
        const entryPoint = this.getEntryPoint(project);
        const builder = new NavigationBuilder(project, entryPoint);
        return builder.build(this.application.options.getValue('readme') !== 'none');
    }
    onRendererBegin(event) {
        if (event.project.groups) {
            event.project.groups.forEach(DefaultTheme.applyGroupClasses);
        }
        for (let id in event.project.reflections) {
            const reflection = event.project.reflections[id];
            if (reflection instanceof index_1.DeclarationReflection) {
                DefaultTheme.applyReflectionClasses(reflection);
            }
            if (reflection instanceof index_1.ContainerReflection && reflection.groups) {
                reflection.groups.forEach(DefaultTheme.applyGroupClasses);
            }
        }
    }
    static getUrl(reflection, relative, separator = '.') {
        let url = reflection.getAlias();
        if (reflection.parent && reflection.parent !== relative &&
            !(reflection.parent instanceof index_1.ProjectReflection)) {
            url = DefaultTheme.getUrl(reflection.parent, relative, separator) + separator + url;
        }
        return url;
    }
    static getMapping(reflection) {
        return DefaultTheme.MAPPINGS.find(mapping => reflection.kindOf(mapping.kind));
    }
    static buildUrls(reflection, urls) {
        const mapping = DefaultTheme.getMapping(reflection);
        if (mapping) {
            if (!reflection.url || !DefaultTheme.URL_PREFIX.test(reflection.url)) {
                const url = [mapping.directory, DefaultTheme.getUrl(reflection) + '.html'].join('/');
                urls.push(new UrlMapping_1.UrlMapping(url, reflection, mapping.template));
                reflection.url = url;
                reflection.hasOwnDocument = true;
            }
            for (const child of reflection.children || []) {
                if (mapping.isLeaf) {
                    DefaultTheme.applyAnchorUrl(child, reflection);
                }
                else {
                    DefaultTheme.buildUrls(child, urls);
                }
            }
        }
        else if (reflection.parent) {
            DefaultTheme.applyAnchorUrl(reflection, reflection.parent);
        }
        return urls;
    }
    static applyAnchorUrl(reflection, container) {
        if (!reflection.url || !DefaultTheme.URL_PREFIX.test(reflection.url)) {
            let anchor = DefaultTheme.getUrl(reflection, container, '.');
            if (reflection['isStatic']) {
                anchor = 'static-' + anchor;
            }
            reflection.url = container.url + '#' + anchor;
            reflection.anchor = anchor;
            reflection.hasOwnDocument = false;
        }
        reflection.traverse((child) => {
            if (child instanceof index_1.DeclarationReflection) {
                DefaultTheme.applyAnchorUrl(child, container);
            }
        });
    }
    static applyReflectionClasses(reflection) {
        const classes = [];
        let kind;
        if (reflection.kind === index_1.ReflectionKind.Accessor) {
            if (!reflection.getSignature) {
                classes.push('tsd-kind-set-signature');
            }
            else if (!reflection.setSignature) {
                classes.push('tsd-kind-get-signature');
            }
            else {
                classes.push('tsd-kind-accessor');
            }
        }
        else {
            kind = index_1.ReflectionKind[reflection.kind];
            classes.push(DefaultTheme.toStyleClass('tsd-kind-' + kind));
        }
        if (reflection.parent && reflection.parent instanceof index_1.DeclarationReflection) {
            kind = index_1.ReflectionKind[reflection.parent.kind];
            classes.push(DefaultTheme.toStyleClass(`tsd-parent-kind-${kind}`));
        }
        let hasTypeParameters = !!reflection.typeParameters;
        reflection.getAllSignatures().forEach((signature) => {
            hasTypeParameters = hasTypeParameters || !!signature.typeParameters;
        });
        if (hasTypeParameters) {
            classes.push('tsd-has-type-parameter');
        }
        if (reflection.overwrites) {
            classes.push('tsd-is-overwrite');
        }
        if (reflection.inheritedFrom) {
            classes.push('tsd-is-inherited');
        }
        if (reflection.flags.isPrivate) {
            classes.push('tsd-is-private');
        }
        if (reflection.flags.isProtected) {
            classes.push('tsd-is-protected');
        }
        if (reflection.flags.isStatic) {
            classes.push('tsd-is-static');
        }
        if (reflection.flags.isExternal) {
            classes.push('tsd-is-external');
        }
        if (!reflection.flags.isExported) {
            classes.push('tsd-is-not-exported');
        }
        reflection.cssClasses = classes.join(' ');
    }
    static applyGroupClasses(group) {
        const classes = [];
        if (group.allChildrenAreInherited) {
            classes.push('tsd-is-inherited');
        }
        if (group.allChildrenArePrivate) {
            classes.push('tsd-is-private');
        }
        if (group.allChildrenAreProtectedOrPrivate) {
            classes.push('tsd-is-private-protected');
        }
        if (group.allChildrenAreExternal) {
            classes.push('tsd-is-external');
        }
        if (!group.someChildrenAreExported) {
            classes.push('tsd-is-not-exported');
        }
        group.cssClasses = classes.join(' ');
    }
    static toStyleClass(str) {
        return str.replace(/(\w)([A-Z])/g, (m, m1, m2) => m1 + '-' + m2).toLowerCase();
    }
}
exports.DefaultTheme = DefaultTheme;
DefaultTheme.MAPPINGS = [{
        kind: [index_1.ReflectionKind.Class],
        isLeaf: false,
        directory: 'classes',
        template: 'reflection.hbs'
    }, {
        kind: [index_1.ReflectionKind.Interface],
        isLeaf: false,
        directory: 'interfaces',
        template: 'reflection.hbs'
    }, {
        kind: [index_1.ReflectionKind.Enum],
        isLeaf: false,
        directory: 'enums',
        template: 'reflection.hbs'
    }, {
        kind: [index_1.ReflectionKind.Module, index_1.ReflectionKind.ExternalModule],
        isLeaf: false,
        directory: 'modules',
        template: 'reflection.hbs'
    }];
DefaultTheme.URL_PREFIX = /^(http|ftp)s?:\/\//;
class NavigationBuilder {
    constructor(project, entryPoint) {
        this.project = project;
        this.entryPoint = entryPoint;
    }
    build(hasSeparateGlobals) {
        const root = new NavigationItem_1.NavigationItem('Index', 'index.html');
        if (this.entryPoint === this.project) {
            const globals = new NavigationItem_1.NavigationItem('Globals', hasSeparateGlobals ? 'globals.html' : 'index.html', root);
            globals.isGlobals = true;
        }
        const modules = [];
        this.project.getReflectionsByKind(index_1.ReflectionKind.SomeModule).forEach((someModule) => {
            let target = someModule.parent;
            let inScope = (someModule === this.entryPoint);
            while (target) {
                if (target.kindOf(index_1.ReflectionKind.ExternalModule)) {
                    return;
                }
                if (this.entryPoint === target) {
                    inScope = true;
                }
                target = target.parent;
            }
            if (inScope && someModule instanceof index_1.DeclarationReflection && someModule.children && someModule.children.length > 0) {
                modules.push(someModule);
            }
        });
        if (modules.length < 10) {
            this.buildGroups(modules, root);
        }
        else {
            this.buildGroups(this.entryPoint.getChildrenByKind(index_1.ReflectionKind.SomeModule), root, true);
        }
        return root;
    }
    buildGroups(reflections, parent, buildChildren = false) {
        let state = -1;
        const hasExternals = this.containsExternals(reflections);
        this.sortReflections(reflections);
        reflections.forEach((reflection) => {
            if (hasExternals && !reflection.flags.isExternal && state !== 1) {
                new NavigationItem_1.NavigationItem('Internals', undefined, parent, 'tsd-is-external');
                state = 1;
            }
            else if (hasExternals && reflection.flags.isExternal && state !== 2) {
                new NavigationItem_1.NavigationItem('Externals', undefined, parent, 'tsd-is-external');
                state = 2;
            }
            const item = NavigationItem_1.NavigationItem.create(reflection, parent);
            this.includeDedicatedUrls(reflection, item);
            if (buildChildren) {
                this.buildChildren(reflection, item);
            }
        });
    }
    buildChildren(reflection, parent) {
        const modules = reflection.getChildrenByKind(index_1.ReflectionKind.SomeModule);
        modules.sort((a, b) => {
            return a.getFullName() < b.getFullName() ? -1 : 1;
        });
        modules.forEach((reflection) => {
            const item = NavigationItem_1.NavigationItem.create(reflection, parent);
            this.includeDedicatedUrls(reflection, item);
            this.buildChildren(reflection, item);
        });
    }
    containsExternals(modules) {
        for (let index = 0, length = modules.length; index < length; index++) {
            if (modules[index].flags.isExternal) {
                return true;
            }
        }
        return false;
    }
    sortReflections(modules) {
        modules.sort((a, b) => {
            if (a.flags.isExternal && !b.flags.isExternal) {
                return 1;
            }
            if (!a.flags.isExternal && b.flags.isExternal) {
                return -1;
            }
            return a.getFullName() < b.getFullName() ? -1 : 1;
        });
    }
    includeDedicatedUrls(reflection, item) {
        (function walk(reflection) {
            for (const child of reflection.children || []) {
                if (child.hasOwnDocument && !child.kindOf(index_1.ReflectionKind.SomeModule)) {
                    if (!item.dedicatedUrls) {
                        item.dedicatedUrls = [];
                    }
                    item.dedicatedUrls.push(child.url);
                    walk(child);
                }
            }
        })(reflection);
    }
}
exports.NavigationBuilder = NavigationBuilder;
//# sourceMappingURL=DefaultTheme.js.map