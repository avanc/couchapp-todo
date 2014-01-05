function(doc) {
    if (doc.type == "todo") {
        if ( doc.subtype=="tickler" ) {
            if (typeof(doc.date) === "undefined") {
                emit(["[No Date]", doc.title], doc);
            }
            else {
                emit([doc.date, doc.title], doc);
            }
        }
    }
};
