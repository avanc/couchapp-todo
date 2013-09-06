function(doc) {
    if (doc.type == "todo") {
        emit(["", doc.title], doc);

        if (typeof(doc.tags) !== "undefined") {

            for (var i=0; i<doc.tags.length; i++) {
                emit([doc.tags[i], doc.title], doc);
            }
        }
    }
};
