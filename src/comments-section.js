function CommentsSection (el, settings) 
{
    this.el = el;
    this.settings = settings; // this.updatedObject(options, el.dataset);

    this.comments = {}; // va fi {}

    this.commentHasReplies = {
        0: [1,2],
        1: [3],
    }; // nu am folosit inca

    this.paginations = {};

    this.collectComments = function(comments = [], self) {
        let stack = {};
        comments.forEach(function(el) {
            stack[el.id] = new Comment(el, self);
        });
        return stack;
    }

    this.collectPaginations = function(paginations = [], self) {
        let stack = {};
        paginations.forEach(function(el) {
            stack[el.id] = new Pagination(el, self);
        });
        return stack;
    }

    this.getRenderOrder = function(comments = {}, sort = "newest") {
        // put them first in schema, then flat them in order
        let sortedCommentIds = this.sortedCommentIds(comments, sort);
        
        let renderSchema = [];
        sortedCommentIds.forEach(function(id) {
            let parent = comments[id].parent || 0;
            renderSchema[parent] ? renderSchema[parent].push(id) : renderSchema[parent] = [id]; 
        });
        let renderOrder = [];
        renderSchema.forEach(function(_, parentId) { parentId = parseInt(parentId);
            if (renderOrder.indexOf(parentId < 0)) renderOrder.push(parentId);
            renderSchema[parentId].forEach(id => { id = parseInt(id);
                if (renderOrder.indexOf(id < 0)) renderOrder.push(id);
            });
        });
        return Array.from(new Set(renderOrder));
    }

    this.sortedCommentIds = function(comments = {}, sort = "newest") {
        let ids = [];
        for (id in comments) {
            if (typeof id != "string" && typeof id != "number") {
                console.log("wrong type");
                console.log(typeof id);
                continue;
            }
            console.log(comments)
            ids.push(id);
        }

        if (sort == "newest") return ids.sort((a, b) => b - a);
        if (sort == "oldest") return ids.sort((a, b) => a - b);
    }

    this.render = function(jsonResponse) {
        // this.el.clear()
        let comments = this.settings.getComments(jsonResponse);
        let paginations = this.settings.getPaginations(jsonResponse);
        this.comments = this.collectComments(comments, this);
        this.paginations = this.collectPaginations(paginations, this);
        let renderOrder = this.getRenderOrder(this.comments, this.settings.sort || "newest");

        renderOrder.forEach(id => {
            // create a fake comment as root, to ensure recursion
            let comment = (id > 0) ? this.comments[id] : new Comment({id:0, parent:0});
            let pagination = this.paginations[comment.parent??0]; // din db, root = null, nu 0
            if (comment.id == 0 && !pagination.rendered) { // daca e practic primul render... o singura posibila situatie
                this.el.appendChild(pagination.render());
                return;
            }
            if (!pagination.rendered) { // ma asigur ca paginatia s-a scris deja
                this.comments[comment.parent??0].repliesSection().appendChild(pagination.render());
            }
            pagination.commentsSection().appendChild(comment.render()); // preprend sometimes!!!
        });
    }

    this.settings.mounted(this.render.bind(this));

    // https://stackoverflow.com/questions/1257040/best-approach-avoid-naming-conflicts-for-javascript-functions-in-separate-js-fi



    //this.options.mounted(this);
}

function Comment(data, app)
{
    this.app = app;
    this.id = data.id;
    this.parent = data.parent;
    this.content = data.content;
    this.rendered = false;

    this.render = function() {
        //console.log(this)
        let comment = document.createElement('div');
        comment.id = "comment_" + this.id;
        comment.innerHTML = `
            <div> 
                <p id="content_of_comment_${this.id}"> ${this.content} </p>
            </div>
            <div class="pagination_container"></div>
        `;
        this.rendered = true;
        return comment;
    }

    this.repliesSection = function() {
        return document.getElementById("comment_"+this.id).getElementsByClassName("pagination_container")[0];
    }
}

function Pagination(data, app)
{
    this.app = app;
    console.log(app)
    this.id = data.id;
    this.prev_page_url = data.prev_page_url;
    this.next_page_url = data.next_page_url;
    this.count_next = data.count_next;
    this.count_prev = data.count_prev;
    this.rendered = false;

    this.render = function() {
        let pagination = document.createElement('div');
        pagination.id = "comment_"+ this.id +"_replies_pagination";
        pagination.innerHTML = `
            <div id=""></div>
            <div id="comments_list_${this.id}"></div>
            <div class="next_page"></div>
        `;
        let nextPage = pagination.getElementsByClassName("next_page")[0];
        if (this.next_page_url) {
            nextPage.innerHTML = `<a href="javascript:;">Next page</a>`;
            nextPage.firstChild.addEventListener("click", this.nextPage);
        }
        this.rendered = true;
        return pagination;
    }

    this.commentsSection = function() {
        return document.getElementById("comments_list_"+(this.id));
    }

    this.nextPage = () => { 
        let comments = [
            {
                id: 10,
                parent: 1,
                content: 'comment 10, parent 1',
            },
            {
                id: 21,
                parent: 1,
                content: 'comment 21, parent 1',
            },
            {
                id: 23,
                parent: 1,
                content: 'comment 23, parent 1',
            },
        ] // this.app.settings.getComments(jsonResponse);
        let paginations = [
            {
                'id': 10,
                'prev_page_url': null,
                'next_page_url': 'foo/bar',
                'count_next': 5,
                'count_prev': 0
            },
            {
                'id': 21,
                'prev_page_url': null,
                'next_page_url': 'foo/bar',
                'count_next': 5,
                'count_prev': 0
            },
            {
                'id': 23,
                'prev_page_url': null,
                'next_page_url': 'foo/bar',
                'count_next': 5,
                'count_prev': 0
            },
        ] // this.app.settings.getPaginations(jsonResponse);
        comments = this.app.collectComments(comments, this);
        this.app.comments = Object.assign(comments, this.app.comments)
        this.app.paginations = Object.assign(this.app.collectPaginations(paginations, this), this.app.paginations);
        let renderOrder = this.app.getRenderOrder(comments, this.app.settings.sort || "newest");

        renderOrder.forEach(id => {
            // create a fake comment as root, to ensure recursion
            let comment = (id > 0) ? this.comments[id] : new Comment({id:0, parent:0});
            let pagination = this.paginations[comment.parent??0]; // din db, root = null, nu 0
            if (comment.id == 0 && !pagination.rendered) { // daca e practic primul render... o singura posibila situatie
                this.el.appendChild(pagination.render());
                return;
            }
            if (!pagination.rendered) { // ma asigur ca paginatia s-a scris deja
                this.comments[comment.parent??0].repliesSection().appendChild(pagination.render());
            }
            pagination.commentsSection().appendChild(comment.render()); // preprend sometimes!!!
        });
    }
}

let el = document.getElementById('comments-section');
let app = new CommentsSection(el, {
    getPaginations: function(response) {
        return [
            {
                'id': 0,
                'prev_page_url': null,
                'next_page_url': 'foo/bar',
                'count_next': 5,
                'count_prev': 0
            },
            {
                'id': 1,
                'prev_page_url': null,
                'next_page_url': 'foo/bar',
                'count_next': 5,
                'count_prev': 0
            },
            {
                'id': 2,
                'prev_page_url': null,
                'next_page_url': 'foo/bar',
                'count_next': 5,
                'count_prev': 0
            },
            {
                'id': 3,
                'prev_page_url': null,
                'next_page_url': 'foo/bar',
                'count_next': 5,
                'count_prev': 0
            },
        ];
    },
    getComments: function(response) {
        return [
            {
                id: 1,
                parent: null,
                content: 'comment 1',
            },
            {
                id: 2,
                parent: null,
                content: 'comment 2',
            },
            {
                id: 3,
                parent: 1,
                content: 'comment 3, parent 1',
            },
        ];
    },

    mounted: function(success) {
        success()
    }
});

// collect - parse paginations, add comments, add replies, add replies pagination