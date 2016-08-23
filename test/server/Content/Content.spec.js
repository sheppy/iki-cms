"use strict";

const PATH_REGEX = /\/+/g;
const isDirectoryStub = { sync: sinon.stub() };
const fsStub = { readFile: sinon.stub() };
const ConfigStub = { get: sinon.stub() };

const path = require("path");
const Content = proxyquire("../../server/Content/Content", {
    "is-directory": isDirectoryStub,
    "fs": fsStub,
    "./../Config": ConfigStub
});

describe("Content", function() {
    describe("getFilenameFromUrl", function() {
        const tests = [
            { root: "Z:/rootA", url: "/test/a", ext: ".ext", indexFile: "index", hasIndex: false, filename: "Z:/rootA/test/a.ext" },
            { root: "Z:/rootB", url: "/test/../../b", ext: ".ext", indexFile: "index", hasIndex: false, filename: "Z:/rootB/b.ext" },
            { root: "Z:/rootC", url: "/test/c", ext: ".txt", indexFile: "index", hasIndex: false, filename: "Z:/rootC/test/c.txt" },
            { root: "Z:/rootD", url: "/test/d", ext: ".txt", indexFile: "index", hasIndex: true, filename: "Z:/rootD/test/d/index.txt" },
        ];

        tests.forEach(function(test) {
            it("gets the filename from the url", function() {
                isDirectoryStub.sync.returns(test.hasIndex);
                Content.getFilenameFromUrl(
                    test.url,
                    test.root.replace(PATH_REGEX, path.sep),
                    test.ext,
                    test.indexFile
                ).should.equal(test.filename.replace(PATH_REGEX, path.sep));
            });
        });
    });

    describe("getFileContent", function() {
        it("returns the content on success", function() {
            fsStub.readFile.callsArgWith(1, null, "data");
            return Content.getFileContent("test").should.eventually.equal("data");
        });

        it("rejects with no error on failure", function() {
            fsStub.readFile.callsArgWith(1, "ERROR");
            return Content.getFileContent("test").should.be.rejectedWith();
        });
    });

    describe("convertFileContentToMarkdown", function() {
        it("sets the __markdown property", function() {
            let input = "# Hello";
            let output = Content.convertFileContentToMarkdown(input);
            output.should.have.property("__markdown");
            output.__markdown.should.equal("# Hello");
        });

        it("sets the __html property", function() {
            let input = "# Hello There";
            let output = Content.convertFileContentToMarkdown(input);
            output.should.have.property("__html");
            output.__html.should.equal("<h1 id=\"hello-there\">Hello There</h1>\n");
        });

        it("deletes the __content property", function() {
            let input = "# Hello";
            let output = Content.convertFileContentToMarkdown(input);
            output.should.not.have.property("__content");
        });

        it("sets the type property", function() {
            let input = "---\ntype: test\n---\n# Hello";
            let output = Content.convertFileContentToMarkdown(input);
            output.should.have.property("type");
            output.type.should.equal("test");
        });

        it("defaults the type property to 'page'", function() {
            let input = "# Hello";
            let output = Content.convertFileContentToMarkdown(input);
            output.should.have.property("type");
            output.type.should.equal("page");
        });

        it("sets the template property", function() {
            let input = "---\ntemplate: test\n---\n# Hello";
            let output = Content.convertFileContentToMarkdown(input);
            output.should.have.property("template");
            output.template.should.equal("test");
        });

        it("defaults the template property to Config.defaultTemplate", function() {
            ConfigStub.get.returns("test-template");
            let input = "# Hello";
            let output = Content.convertFileContentToMarkdown(input);
            output.should.have.property("template");
            output.template.should.equal("test-template");
        });
    });

    describe("loadMarkdownFile", function() {
        it("gets the file content then converts it to markdown");
    });

    describe("load", function() {
        it("returns the markdown from a request");
    });
});
