    // https://stackoverflow.com/questions/1257040/best-approach-avoid-naming-conflicts-for-javascript-functions-in-separate-js-fi

function CommentsSection (el, settings) 
{
    this.app = {
        el: el,
        settings: settings,
        comments: {},
        paginations: {},
        
        collectComments(comments = []) {
            let stack = {};
            comments.forEach( el => {
                let comment = this.settings.legend.comment ? this.translate(el, this.settings.legend.comment) : el;
                if (!this.comments[comment.id])
                    stack[comment.id] = new Comment(comment, this);
            });
            this.comments = Object.assign(this.comments, stack);

            return stack;
        },

        collectPaginations(paginations = []) {
            console.log(1,paginations)
            let stack = {};
            paginations.forEach( el => {
                let pagination = this.settings.legend.pagination ? this.translate(el, this.settings.legend.pagination) : pagination;
                if (!this.paginations[pagination.id])
                    stack[pagination.id] = new Pagination(pagination, this);
            });
            this.paginations = Object.assign(this.paginations, stack);

            return stack;
        },

        getRenderOrder(comments = {}) {
            // put them first in schema, then flat them in order
            let sortedCommentIds = this.sortedCommentIds(comments);
            let renderSchema = [];
            sortedCommentIds.forEach(function(id) {
                let parent = comments[id].parent || 0;
                renderSchema[parent] ? renderSchema[parent].push(id) : renderSchema[parent] = [id]; 
            });
            
            let renderOrder = [];
            renderSchema.forEach(function(_, parentId) { parentId = parseInt(parentId);
                renderOrder.push(parentId);
                renderSchema[parentId].forEach(id => { id = parseInt(id);
                    renderOrder.push(id);
                });
            });
            
            return (Array.from(new Set(renderOrder))).filter(id => id > 0); // remove duplicates
        },

        sortedCommentIds(comments = {}, sort = "newest") {
            let ids = [];
            for (id in comments) {
                if (typeof id != "string" && typeof id != "number") {
                    console.log("wrong type");
                    console.log(typeof id);
                    continue;
                }
                ids.push(id);
            }
    
            if (sort == "newest") return ids.sort((a, b) => b - a);
            if (sort == "oldest") return ids.filter((a, b) => a - b);
        },

        translate(target, legend, reverse = false) { // reverse true doar cand ies afara din app
            let result = {};
            for (key in legend) {
                let ak = reverse ? legend[key] : key;
                result[ak] = target[ak];
                console.log(target, result)
            }
            return result;
        }, 

        render(jsonResponse) {
            // this.el.clear()
            let comments = this.settings.getComments(jsonResponse);
            let paginations = this.settings.getPaginations(jsonResponse);
            console.log(12, paginations)
            comments = this.collectComments(comments);
            paginations = this.collectPaginations(paginations);
            let renderOrder = this.getRenderOrder(comments);
    
            renderOrder.forEach(comment_id => {
                let comment = this.comments[comment_id];
                let parentPagination = this.paginations[comment.parent??0];
                if (!parentPagination.rendered) {
                    let parentNode = parentPagination.id == 0 ? this.el : comment.getParent().nodePaginationContainer();
                    parentNode.appendChild(parentPagination.render());
                }
                if (parentPagination.id == 0)
                    parentPagination.addCreateCommentButton();
                if (!comment.rendered)
                    parentPagination.nodeCommentsSection().appendChild(comment.render()); // prepend sometimes
                if (comment.getChildPagination() && !comment.getChildPagination().rendered)
                    comment.nodePaginationContainer().appendChild(comment.getChildPagination().render());
                comment.addReplyButton();
                this.paginations[0].openCreateCommentForm()
            });
        }
    }
    this.app.settings.mounted(this.app.render.bind(this.app));

    return this.app;
}

let el = document.getElementById('comments-section');
let app = new CommentsSection(el, {
    getPaginations: function(response) { // 
        let paginations = [response];
        response.data.forEach(comment => {
            paginations.push({
                id: comment.id || 0,
                prev_page_url: null,
                next_page_url: `/comments?article=1&comment=${comment.id}`,
                count_next: comment.count_replies,
                count_prev: 0,
            })
        });
    },
    getComments: function(response) {
        return response.data;
    },

    mounted: function(success) {
        axios.get("/comments", {params: {article: 1}}).then( res => {
            success(res.data);
        })
    },

    legend: {
        comment: {
            id: "id",
            parent: "parent",
            content: "content",
            count_replies: "count_replies"
        },
        pagination: {
            id: "id",
            next_page_url: "next_page_url",
            prev_page_url: "prev_page_url",
            count_next: "count_next",
            count_prev: "count_prev"
        }
    }
});

function KBsize(obj) {
    let size = sizeof(obj);
    console.log(Math.round(size/1024) + 'kb');
}

// collect - parse paginations, add comments, add replies, add replies pagination