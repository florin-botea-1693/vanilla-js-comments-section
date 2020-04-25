function Pagination(data, app)
{
    this.app = app;
    this.id = data.id;
    this.prev_page_url = data.prev_page_url;
    this.next_page_url = data.next_page_url;
    this.count_next = data.count_next;
    this.count_prev = data.count_prev;
    this.createCommentButtonShown = false;
    this.createCommentForm = false;
    this.rendered = false;
    this.el = null

    this.render = function() {
        let pagination = document.createElement('div');
        pagination.id = "comment_"+ this.id +"_replies_pagination";
        pagination.innerHTML = `
            <div id="">  </div>
            <div id="comments_section_${this.id}"></div>
            <div class="add_reply"></div>
            <div class="next_page"></div>
        `;
        let nextPage = pagination.getElementsByClassName("next_page")[0];
        if (this.next_page_url) {
            nextPage.innerHTML = `<a href="javascript:;">Next page</a>`;
            nextPage.firstChild.addEventListener("click", this.nextPage);
        }
        this.el = pagination;
        this.rendered = true;
        if (this.id==0)
            this.openCreateCommentForm();
        return this.el;
    }

    this.addCreateCommentButton = function(force = false) {
        if (this.createCommentButtonShown || (this.createCommentForm && force == false))
            return;
        this.el.getElementsByClassName("add_reply")[0].innerHTML = `
            <a href="javascript:;" class="addReply_btn"> Add reply </a>
        `;
        this.el.getElementsByClassName("add_reply")[0].getElementsByClassName("addReply_btn")[0]
            .addEventListener("click", this.openCreateCommentForm.bind(this))
        this.createCommentButtonShown = true;
        this.createCommentForm = false;
    }

    this.openCreateCommentForm = function() {
        console.log(this)
        if (this.createCommentForm)
            return;
        let container = this.el.getElementsByClassName("add_reply")[0];
        container.innerHTML = "";
        console.log(container)
        this.createCommentButtonShown = false;
        this.createCommentForm = new CommentForm(this, this.app.comments[this.id], this.app).render();
        container.appendChild(this.createCommentForm);
    }

    this.nodeCommentsSection = function() {
        return document.getElementById("comments_section_"+(this.id));
    }

    this.nextPage = () => {

        this.app.settings.getComments = () => [
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
        ];
        this.app.settings.getPaginations = () => [
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
        ];
        this.app.render() // jsonresponse
        this.updateNextPage('this.app.getPaginations(jsonresponse).find.pagination.id');
    }
}