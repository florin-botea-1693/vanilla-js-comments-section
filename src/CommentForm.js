function CommentForm(pagination, parent, app) 
{
    this.app = app;
    this.parent = parent || {id: 0};
    this.pagination = pagination;
    this.el = null;

    this.render = function() {
        let form = document.createElement('div');
        form.innerHTML = `
            <form class="">
                <textarea> pagination ${this.pagination.id}, parent ${this.parent.id} </textarea>
                <button class="btn_submit"> Add </button>
            </form>
        `;
        this.el = form;
        this.el.getElementsByClassName("btn_submit")[0].addEventListener("click", this.submit.bind(this));
        // add event listners
        return form;
    }

    this.submit = function() {
        alert(1);
        return false;
    }
}