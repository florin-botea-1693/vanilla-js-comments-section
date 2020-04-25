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

    this.getParent = function() {
        return (this.parent ? this.app.comments[this.parent] : null);
    }

    this.getChildPagination = function() {
        return (this.app.paginations[this.id] || null);
    }

    this.nodePaginationContainer = function() {
        return document.getElementById("comment_"+this.id).getElementsByClassName("pagination_container")[0];
    }

    this.addReplyButton = function() {
        this.getChildPagination().addCreateCommentButton();
    }
}