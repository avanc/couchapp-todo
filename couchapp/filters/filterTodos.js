function(doc, req) {
    if (doc.type && doc.type == 'todo') {
        return true;
    }
    else if (doc.id == '_design/todo') {
        return true;
    }
    else
    {
        return false;
    }
};
