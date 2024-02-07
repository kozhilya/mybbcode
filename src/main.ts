import MybbCode from "./mybb-code";

(window as any).MyBBCode = (window as any).MyBBCode || (() => {
    return new MybbCode();
})();