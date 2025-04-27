# utilis.py

def save_experiment_TFIDF(tfidf_vect, grid_search, Model_best, X_train, y_train, X_test, y_test):
    tfidf_params = tfidf_vect.get_params()
    tfidf_descr = (
        f"TFIDF("
        f"max_features={tfidf_params['max_features']}, "
        f"ngram_range={tfidf_params['ngram_range']}, "
        f"max_df={tfidf_params['max_df']}, "
        f"min_df={tfidf_params['min_df']}"
        f")"
    )

    best_clf = grid_search.best_estimator_.named_steps['clf']
    raw = grid_search.best_params_
    model_name = type(best_clf).__name__
    model_descr = (
        f"{model_name}(" 
        + ", ".join(f"{k}={v}" for k, v in raw.items())
        + ")"
    )
    train_acc = Model_best.score(X_train, y_train)
    test_acc  = Model_best.score(X_test, y_test)

    log_line = (
        f"{model_descr} | "
        f"{tfidf_descr} | "
        f"Accuracy train={train_acc:.3f}, test={test_acc:.3f}\n"
    )

    log_path = "../experiment_log.txt"

    try:
        with open(log_path, "r") as log_file:
            existing_lines = log_file.readlines()
    except FileNotFoundError:
        existing_lines = []

    if log_line in existing_lines:
        print("⚠️ Riga già presente nel file, non verrà aggiunta.")
    else:
        with open(log_path, "a") as log_file:
            log_file.write(log_line)
        print("✅ Riga di log aggiunta in 'experiment_log.txt':")
        print(log_line)


def save_experiment_W2V(w2v_model, grid_search, Model_best, X_train, y_train, X_test, y_test):
    w2v_descr = (
        f"W2V("
        f"vector_size={w2v_model.vector_size}, "
        f"window={w2v_model.window}, "
        f"min_count={w2v_model.min_count}, "
        f"epochs={w2v_model.epochs}"
        f")"
    )

    best_clf = grid_search.best_estimator_.named_steps['clf']
    raw = grid_search.best_params_
    model_name = type(best_clf).__name__
    model_descr = (
        f"{model_name}(" 
        + ", ".join(f"{k}={v}" for k, v in raw.items())
        + ")"
    )

    train_acc = Model_best.score(X_train, y_train)
    test_acc  = Model_best.score(X_test, y_test)

    log_line = (
        f"{model_descr} | "
        f"{w2v_descr} | "
        f"Accuracy train={train_acc:.3f}, test={test_acc:.3f}\n"
    )

    log_path = "../experiment_log.txt"

    try:
        with open(log_path, "r") as log_file:
            existing_lines = log_file.readlines()
    except FileNotFoundError:
        existing_lines = []

    if log_line in existing_lines:
        print("⚠️ Riga già presente nel file, non verrà aggiunta.")
    else:
        with open(log_path, "a") as log_file:
            log_file.write(log_line)
        print("✅ Riga di log aggiunta in 'experiment_log.txt':")
        print(log_line)


def save_experiment_D2V(d2v_model, grid_search, Model_best, X_train, y_train, X_test, y_test):
    d2v_descr = (
        f"D2V("
        f"vector_size={d2v_model.vector_size}, "
        f"window={d2v_model.window}, "
        f"min_count={d2v_model.min_count}, "
        f"dm={d2v_model.dm}, "
        f"epochs={d2v_model.epochs}"
        f")"
    )

    best_clf = grid_search.best_estimator_.named_steps['clf']
    raw = grid_search.best_params_
    model_name = type(best_clf).__name__
    model_descr = (
        f"{model_name}(" 
        + ", ".join(f"{k}={v}" for k, v in raw.items())
        + ")"
    )

    train_acc = Model_best.score(X_train, y_train)
    test_acc  = Model_best.score(X_test, y_test)

    log_line = (
        f"{model_descr} | "
        f"{d2v_descr} | "
        f"Accuracy train={train_acc:.3f}, test={test_acc:.3f}\n"
    )

    log_path = "../experiment_log.txt"

    try:
        with open(log_path, "r") as log_file:
            existing_lines = log_file.readlines()
    except FileNotFoundError:
        existing_lines = []

    if log_line in existing_lines:
        print("⚠️ Riga già presente nel file, non verrà aggiunta.")
    else:
        with open(log_path, "a") as log_file:
            log_file.write(log_line)
        print("✅ Riga di log aggiunta in 'experiment_log.txt':")
        print(log_line)


def save_experiment_BERT(grid_search, Model_best, X_train_embed, y_train, X_test_embed, y_test):
    sbert_descr = (
        f"SBERT()"
    )

    best_clf = grid_search.best_estimator_.named_steps['clf']
    raw = grid_search.best_params_
    model_name = type(best_clf).__name__
    model_descr = (
        f"{model_name}(" 
        + ", ".join(f"{k}={v}" for k, v in raw.items())
        + ")"
    )

    train_acc = Model_best.score(X_train_embed, y_train)
    test_acc  = Model_best.score(X_test_embed, y_test)

    log_line = (
        f"{model_descr} | "
        f"{sbert_descr} | "
        f"Accuracy train={train_acc:.3f}, test={test_acc:.3f}\n"
    )

    log_path = "../experiment_log.txt"

    try:
        with open(log_path, "r") as log_file:
            existing_lines = log_file.readlines()
    except FileNotFoundError:
        existing_lines = []

    if log_line in existing_lines:
        print("⚠️ Riga già presente nel file, non verrà aggiunta.")
    else:
        with open(log_path, "a") as log_file:
            log_file.write(log_line)
        print("✅ Riga di log aggiunta in 'experiment_log.txt':")
        print(log_line)
