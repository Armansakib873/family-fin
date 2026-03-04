
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
     import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, sendPasswordResetEmail, updatePassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
       import { getFirestore, collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, doc, updateDoc, deleteDoc, getDocs, writeBatch, runTransaction } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
          import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js";

        // CONFIGURATION
        const firebaseConfig = {
            apiKey: "AIzaSyAyKOSGIxShRaY8RQSMKVSjp1oiAmL-yvM",
            authDomain: "family-fin-eb81e.firebaseapp.com",
            projectId: "family-fin-eb81e",
            storageBucket: "family-fin-eb81e.firebasestorage.app",
            messagingSenderId: "962963649705",
            appId: "1:962963649705:web:ba40263dba5ab1799825b8",
            measurementId: "G-K4W3Y4R4EV"
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);
        const functions = getFunctions(app);

        /* --- GLOBAL STATE --- */
        const State = { user: null, txs: [], loans: [], accounts: [], categories: { income: [], expense: [] }, selectedMonth: 'all' };

          const Lang = {
            current: localStorage.getItem('bhalo_lang') || 'bn',
            t(key) {
                const dict = {
                    en: { 
                        assets: "Total Assets", inc: "Income", exp: "Expense", tx: "Transactions", add: "Add New", 
                        addTx: "New Entry", save: "Save", category: "Category", analytics: "AI Analytics", 
                        ai_opinion: "AI Opinion", settings: "Settings", add_acc: "Manage Accounts", 
                        add_cat: "Manage Categories", data_mgmt: "Data Management", export: "Export Data", 
                        income_log: "Income Logs", expense_log: "Expense Logs", no_data: "No data available", 
                        viewAll: "View All", all_data: "All Data", reset_data: "Reset All Data",
                        loan_summary: "Receivables / Payables", owed_to_you: "Owed To You", you_owe: "You Owe",
                        loan_management: "Loan Management", add_loan: "Add New Loan", loan_taken: "Loan Taken",
                        loan_given: "Loan Given", make_payment: "Make Payment", settle_loan: "Settle Loan",
                        add_payment: "Add Payment", remaining_balance: "Remaining",
                          profile_settings: "Profile Settings",
                change_name: "Change Family Name",
                change_pass: "Change Password",
                update_btn: "Update",
                edit_name_title: "Edit Family Name",
                change_pass_title: "Change Password",
                expense: "Expense",
                income: "Income",
                transfer: "Transfer",
                add_another: "Add Another"
        
                    },
                    bn: { 
                        assets: "মোট সম্পদ", inc: "আয়", exp: "ব্যয়", tx: "লেনদেন", add: "নতুন", 
                        addTx: "নতুন এন্ট্রি", save: "সেভ করুন", category: "ক্যাটাগরি", analytics: "এআই বিশ্লেষণ", 
                        ai_opinion: "এআই পরামর্শ", settings: "সেটিংস", add_acc: "অ্যাকাউন্ট ম্যানেজ", 
                        add_cat: "ক্যাটাগরি ম্যানেজ", data_mgmt: "ডাটা ম্যানেজমেন্ট", export: "ডাটা এক্সপোর্ট", 
                        income_log: "আয়ের হিসাব", expense_log: "ব্যয়ের হিসাব", no_data: "কোন তথ্য নেই", 
                        viewAll: "সব দেখুন", all_data: "সব ডাটা", reset_data: "সব ডাটা রিসেট",
                        
                        // UPDATED TERMS HERE
                        loan_summary: "দেনা - পাওনা", 
                        owed_to_you: "পাওনা", // This is money others owe you (Receivables)
                        you_owe: "দেনা",      // This is money you owe others (Payables)

                        loan_management: "ঋণ ব্যবস্থাপনা", add_loan: "নতুন ঋণ", loan_taken: "ঋণ গ্রহণ",
                        loan_given: "ঋণ প্রদান", make_payment: "পরিশোধ করুন", settle_loan: "ঋণ পরিশোধ",
                        add_payment: "পেমেন্ট যোগ করুন", remaining_balance: "বকেয়া",

                          profile_settings: "প্রোফাইল সেটিংস",
                change_name: "নাম পরিবর্তন করুন",
                change_pass: "পাসওয়ার্ড পরিবর্তন",
                update_btn: "আপডেট করুন",
                edit_name_title: "নাম পরিবর্তন",
                change_pass_title: "পাসওয়ার্ড পরিবর্তন",
                expense: "ব্যয়",
                income: "আয়",
                transfer: "স্থানান্তর",
                add_another: "আরও যোগ করুন"
                    }
                };
                return dict[this.current][key] || key;
            }
        };

      /* --- AUTH --- */
/* --- AUTH --- */
window.Auth = {
    isRegister: false,
    init() {
        onAuthStateChanged(auth, (user) => {
            const loadingView = document.getElementById('loading-view');
            const authView = document.getElementById('auth-view');
            const appView = document.getElementById('app-view');

            if (user) {
                State.user = user;
                if(loadingView) loadingView.style.display = 'none';
                authView.style.display = 'none';
                appView.style.display = 'flex';
                document.getElementById('display-name').innerText = user.displayName || "Family";
                Data.initListeners();
                window.UI.init();
            } else {
                if(loadingView) loadingView.style.display = 'none';
                appView.style.display = 'none';
                authView.style.display = 'flex';
            }
        });

        // Main Login/Signup Form
        document.getElementById('auth-form').onsubmit = (e) => {
            e.preventDefault();
            const email = document.getElementById('auth-email').value;
            const pass = document.getElementById('auth-pass').value;
            const name = document.getElementById('auth-name').value;
            const errorEl = document.getElementById('auth-error');
            const btn = document.getElementById('auth-btn');
            
            errorEl.innerText = "";
            btn.textContent = "Processing...";
            btn.disabled = true;

            if (this.isRegister) {
                createUserWithEmailAndPassword(auth, email, pass)
                    .then((cred) => updateProfile(cred.user, { displayName: name }))
                    .then(() => Data.seedData(auth.currentUser.uid))
                    .catch((err) => {
                        errorEl.innerText = this.cleanError(err.message);
                        btn.textContent = "Sign Up";
                        btn.disabled = false;
                    });
            } else {
                signInWithEmailAndPassword(auth, email, pass)
                    .catch((err) => {
                        errorEl.innerText = "Invalid Email or Password";
                        btn.textContent = "Login";
                        btn.disabled = false;
                    });
            }
        };

        // Reset Password Form Listener
        document.getElementById('reset-form').onsubmit = (e) => {
            e.preventDefault();
            const email = document.getElementById('reset-email').value;
            const btn = document.getElementById('reset-btn');
            
            btn.textContent = "Sending...";
            btn.disabled = true;

            sendPasswordResetEmail(auth, email)
                .then(() => {
                    UI.closeModals();
                    UI.showNotification("Reset link sent! Check your email.", "success");
                    btn.textContent = "Send Reset Link";
                    btn.disabled = false;
                })
                .catch((error) => {
                    UI.showNotification(this.cleanError(error.message));
                    btn.textContent = "Send Reset Link";
                    btn.disabled = false;
                });
        };
    },

    toggle() {
        this.isRegister = !this.isRegister;
        
        // Toggle Elements
        document.getElementById('auth-name').style.display = this.isRegister ? 'block' : 'none';
        document.getElementById('forgot-pass-link').style.display = this.isRegister ? 'none' : 'block';
        
        // Update Text
        document.getElementById('auth-title-text').textContent = this.isRegister ? 'Create Account' : 'Family-Fin Cloud';
        document.getElementById('auth-subtitle').textContent = this.isRegister ? 'Start tracking your family expenses' : 'Secure Family Expense Tracker';
        document.getElementById('auth-btn').textContent = this.isRegister ? 'Sign Up' : 'Login';
        
        // Update Bottom Link
        document.getElementById('auth-toggle-text').textContent = this.isRegister ? 'Have an account? ' : 'New here? ';
        document.getElementById('auth-toggle-btn').textContent = this.isRegister ? 'Login' : 'Create Account';
        
        // Clear errors
        document.getElementById('auth-error').innerText = "";
    },

    cleanError(msg) {
        // Helper to make Firebase errors readable
        return msg.replace('Firebase: ', '').replace('auth/', '').replace(/-/g, ' ').replace('.', '');
    },

    logout() { 
        signOut(auth).then(() => window.location.reload());
    }
};

 /* --- DATA --- */
        const Data = {
            initListeners() {
                if(!State.user) return;
                const uid = State.user.uid;

                // Listen to all relevant collections
                ["transactions", "accounts", "categories", "loans", "settlements"].forEach(coll => {
                    const q = query(collection(db, coll), where("uid", "==", uid));
                    onSnapshot(q, (snap) => {
                        let shouldRender = true;
                        switch (coll) {
                            case 'transactions':
                                State.txs = snap.docs.map(d => ({id: d.id, ...d.data()})).sort((a, b) => new Date(b.date) - new Date(a.date));
                                UI.populateMonthFilter();
                                break;
                            case 'accounts':
                                State.accounts = snap.docs.map(d => ({id: d.id, name: d.data().name})).sort((a,b) => a.name.localeCompare(b.name));
                                // FIX: Removed automatic seeding to prevent race conditions on reset.
                                // Seeding now only happens on new user creation or manual reset.
                                break;
                            case 'categories':
                                const cats = snap.docs.map(d => ({id: d.id, ...d.data()}));
                                State.categories.income = cats.filter(c => c.type === 'income').sort((a,b) => a.name.localeCompare(b.name));
                                State.categories.expense = cats.filter(c => c.type === 'expense').sort((a,b) => a.name.localeCompare(b.name));
                                break;
                            case 'loans':
                                State.loans = snap.docs.map(d => ({id: d.id, ...d.data()}));
                                break;
                            case 'settlements':
                                // We don't need to store settlements in the global state,
                                // but listening ensures UI updates if a settlement is ever deleted in the future.
                                break;
                            default:
                                shouldRender = false;
                        }
                        if (shouldRender) {
                            UI.renderPage(UI.currentPage);
                        }
                    });
                });
            },
            


         async addTx(tx) { await addDoc(collection(db, "transactions"), { ...tx, uid: State.user.uid, timestamp: serverTimestamp() }); },
            async updateTx(id, tx) { await updateDoc(doc(db, "transactions", id), tx); },
            async addMeta(coll, data) { await addDoc(collection(db, coll), { ...data, uid: State.user.uid }); },
            async updateMeta(coll, id, data) { await updateDoc(doc(db, coll, id), data); },
            async deleteMeta(coll, id) { await deleteDoc(doc(db, coll, id)); },
            async seedData(uid) {
                // Default accounts to be created for a new user
                const defaultAccounts = ['Cash', 'bKash', 'Bank'];
                defaultAccounts.forEach(name => {
                    addDoc(collection(db, "accounts"), { name, uid });
                });

                // Default income categories
                const defaultIncomeCategories = ['Salary', 'Business', 'Bonus', 'Gift'];
                defaultIncomeCategories.forEach(name => {
                    addDoc(collection(db, "categories"), { name, type: 'income', uid });
                });
                
                // Default expense categories
                const defaultExpenseCategories = ['Bazar', 'Transport', 'Utilities', 'Shopping', 'Health', 'Food', 'Entertainment'];
                defaultExpenseCategories.forEach(name => {
                    addDoc(collection(db, "categories"), { name, type: 'expense', uid });
                });
            },


              // NEW: Function to reset all user data
             async resetAllData() {
                if (!State.user) return;
                const uid = State.user.uid;
                const collectionsToDelete = ['transactions', 'loans', 'settlements'];
                const batch = writeBatch(db);

                for (const coll of collectionsToDelete) {
                    const q = query(collection(db, coll), where("uid", "==", uid));
                    const snapshot = await getDocs(q);
                    snapshot.docs.forEach(d => batch.delete(d.ref));
                }
                await batch.commit();
            },

            async addLoanAndTransaction(loanData, txData) {
                const loanRef = await addDoc(collection(db, "loans"), { ...loanData, uid: State.user.uid, timestamp: serverTimestamp() });
                await addDoc(collection(db, "transactions"), { ...txData, uid: State.user.uid, timestamp: serverTimestamp(), isLoan: true, loanId: loanRef.id });
            },

            // FIX: This function has been completely rewritten to work correctly.
            async addSettlementAndUpdateLoan(loanId, settlementData, txData) {
                const loanRef = doc(db, "loans", loanId);

                await runTransaction(db, async (transaction) => {
                    // Step 1: READ the loan doc *inside* the transaction
                    const loanDoc = await transaction.get(loanRef);
                    if (!loanDoc.exists()) {
                        throw "Error: This loan does not exist.";
                    }

                    // Step 2: PERFORM calculations based on the fresh data
                    const currentBalance = loanDoc.data().currentBalance;
                    const newBalance = currentBalance - settlementData.amount;
                    const newStatus = newBalance <= 0 ? "settled" : "active";

                    // Step 3: WRITE all changes to the database
                    transaction.update(loanRef, { currentBalance: newBalance, status: newStatus });
                    
                    const settlementRef = doc(collection(db, "settlements"));
                    transaction.set(settlementRef, { ...settlementData, loanId: loanId, uid: State.user.uid, timestamp: serverTimestamp() });
                    
                    const txRef = doc(collection(db, "transactions"));
                    transaction.set(txRef, { ...txData, uid: State.user.uid, timestamp: serverTimestamp(), isLoan: true, loanId: loanId, settlementId: settlementRef.id });
                });
            },
    

            
        };


        

        

           /* --- UI CONTROLLER --- */
        window.UI = {
            currentPage: 'dashboard', loanPageType: 'taken', currentLoanType: 'taken', currentTxType: 'expense', manageType: 'account', manageCatType: 'expense',
            lineChartInstance: null, catChartInstance: null, bulkTxs: [],

   init() {
                // Set initial state for history-based navigation
                if (!history.state) {
                    history.replaceState({ page: 'dashboard' }, "");
                }

                // Set initial language and render the first page
                this.updateLangDisplay();
                // Pass true to prevent pushState on initial load
                this.renderPage('dashboard', true);
                
                this.initModalInteractions();

                // Advanced Back Button Handling for Mobile
                window.onpopstate = (e) => {
                    const activeModal = document.querySelector('.modal-overlay.active');
                    if (activeModal) {
                        // If a modal is open, back button closes it
                        this.closeModals(true);
                    } else if (e.state && e.state.page) {
                        // Otherwise, navigate between pages
                        this.renderPage(e.state.page, true);
                    }
                };
                
                // --- Add Event Listeners for Modal Forms ---

                // Listener for the main transaction form (Add/Edit Expense/Income)
                document.getElementById('tx-form').onsubmit = async (e) => {
                    e.preventDefault();
                    
                    const btn = document.getElementById('save-btn');
                    const id = document.getElementById('tx-id').value;

                    // If editing, we just save the single item
                    if (id) {
                        btn.disabled = true;
                        btn.textContent = "Updating...";
                        const txData = UI.getTxFormData();
                        if (!txData) { btn.disabled = false; btn.textContent = Lang.t('save'); return; }
                        await Data.updateTx(id, txData);
                        this.showNotification('Transaction updated!', 'success');
                        this.closeModals();
                        return;
                    }

                    // Otherwise (Add New context)
                    // If there are bulk items, save all + current form (if form is valid/partially filled)
                    // If form is empty but list is NOT, just save list.
                    
                    const currentTx = UI.getTxFormData(true); // silent validation
                    const allToSave = [...this.bulkTxs];
                    if (currentTx) allToSave.push(currentTx);

                    if (allToSave.length === 0) {
                        this.showNotification("Please enter an amount or add items to the list.");
                        return;
                    }

                    btn.disabled = true;
                    btn.textContent = "Saving All...";

                    try {
                        const batch = writeBatch(db);
                        allToSave.forEach(tx => {
                            const ref = doc(collection(db, "transactions"));
                            batch.set(ref, { ...tx, uid: State.user.uid, timestamp: serverTimestamp() });
                        });
                        await batch.commit();
                        this.showNotification(`${allToSave.length} Transactions saved!`, 'success');
                        this.closeModals();
                    } catch (err) {
                        this.showNotification("Error saving batch: " + err.message);
                    } finally {
                        btn.disabled = false;
                        btn.textContent = Lang.t('save');
                    }
                };

                // Listener for the new loan form
                document.getElementById('loan-form').onsubmit = (e) => { 
                    e.preventDefault(); 
                    UI.saveLoan(); // The saveLoan function contains its own validation
                };

                // Listener for the loan settlement form
                document.getElementById('settle-form').onsubmit = (e) => { 
                    e.preventDefault(); 
                    UI.saveSettlement(); // The saveSettlement function contains its own validation
                };

                // --- Add Event Listeners for Real-time Validation in Modals ---

                // Listen for changes in the transaction modal to update the live balance display
                document.getElementById('tx-account').addEventListener('change', () => UI.updateModalAccountBalance());
                document.getElementById('tx-amount').addEventListener('input', () => UI.updateModalAccountBalance());
                  document.getElementById('loan-account').addEventListener('change', () => UI.updateLoanModalAccountBalance()); // Use Arrow function for safety
    document.getElementById('loan-amount').addEventListener('input', () => UI.updateLoanModalAccountBalance());   // Use Arrow function for safety

    // NEW LISTENERS FOR SETTLE MODAL
    document.getElementById('settle-account').addEventListener('change', () => UI.updateSettleModalAccountBalance());
    document.getElementById('settle-amount').addEventListener('input', () => UI.updateSettleModalAccountBalance());


            },

            initModalInteractions() {
                const closeAll = () => {
                    this.closeModals();
                    if (typeof this.closeQuickAddModal === 'function') this.closeQuickAddModal();
                };

                // Click outside to close
                document.querySelectorAll('.modal-overlay').forEach(overlay => {
                    overlay.addEventListener('click', (e) => {
                        if (e.target === overlay) closeAll();
                    });
                });

                // Swipe down to close
                document.querySelectorAll('.bottom-sheet').forEach(sheet => {
                    let startY = 0;
                    let currentY = 0;
                    let isDragging = false;

                    sheet.addEventListener('touchstart', (e) => {
                        if (sheet.scrollTop <= 0) {
                            startY = e.touches[0].clientY;
                            currentY = startY; // Prevent stale currentY from previous touches
                            isDragging = true;
                            sheet.style.transition = 'none';
                        }
                    }, {passive: true});

                    sheet.addEventListener('touchmove', (e) => {
                        if (!isDragging) return;
                        currentY = e.touches[0].clientY;
                        const diffY = currentY - startY;

                        if (diffY > 0) {
                            if(e.cancelable) e.preventDefault();
                            sheet.style.transform = `translateY(${diffY}px)`;
                        }
                    }, {passive: false});

                    sheet.addEventListener('touchend', (e) => {
                        if (!isDragging) return;
                        isDragging = false;
                        sheet.style.transition = 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)';
                        
                        const diffY = currentY - startY;
                        const threshold = sheet.offsetHeight * 0.8;
                        
                        if (diffY > threshold) {
                            closeAll();
                            setTimeout(() => { sheet.style.transform = ''; }, 300);
                        } else {
                            sheet.style.transform = '';
                        }
                    });
                });
            },

            // Helper to open modals with history support
            openModal(id) {
                const modal = document.getElementById(id);
                if (modal) {
                    modal.classList.add('active');
                    history.pushState({ isModal: true, page: this.currentPage }, "");
                }
            },

            // Add inside window.UI object
openResetModal() {
    this.openModal('reset-modal');
    document.getElementById('reset-email').value = document.getElementById('auth-email').value; // Pre-fill email if typed
},

               showNotification(message, type = 'error') {
                const container = document.getElementById('notification-container');
                const notif = document.createElement('div');
                notif.className = 'notification';
                notif.classList.add(type);
                notif.textContent = message;
                
                container.appendChild(notif);
                setTimeout(() => { notif.classList.add('entering'); }, 10);
                setTimeout(() => { 
                    notif.classList.remove('entering');
                    notif.classList.add('exiting');
                }, 3000);
                setTimeout(() => { notif.remove(); }, 3300);
            },


           toggleLanguage() {
            Lang.current = Lang.current === 'bn' ? 'en' : 'bn';
            localStorage.setItem('bhalo_lang', Lang.current);
            this.updateLangDisplay();
            this.renderPage(this.currentPage); // Re-render to apply language to dynamic content
        },
            
              updateLangDisplay() {
            if (Lang.current === 'bn') {
                document.body.classList.add('lang-bn');
            } else {
                document.body.classList.remove('lang-bn');
            }
            document.getElementById('lang-display').textContent = Lang.current === 'bn' ? 'বাংলা' : 'EN';
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                el.textContent = Lang.t(key);
            });
        },

                formatMoney(amt) { return new Intl.NumberFormat(Lang.current==='bn'?'bn-BD':'en-US').format(amt); },

            getAccountBalance(accName) {
                return State.txs.reduce((bal, tx) => {
                    if (tx.type === 'transfer') {
                        if (tx.account === accName) return bal - tx.amount;
                        if (tx.toAccount === accName) return bal + tx.amount;
                        return bal;
                    }
                    if (tx.account !== accName) return bal;
                    return tx.type === 'income' ? bal + tx.amount : bal - tx.amount;
                }, 0);
            },
            
            filterDataByMonth(month) {
                State.selectedMonth = month;
                this.renderPage(this.currentPage);
            },
            
            populateMonthFilter() {
                const filterEl = document.getElementById('month-filter');
                if (!filterEl) return;

                const months = [...new Set(State.txs.map(tx => tx.date.substring(0, 7)))];
                let options = `<option value="all">${Lang.t('all_data')}</option>`;
                months.sort().reverse().forEach(month => {
                    options += `<option value="${month}" ${State.selectedMonth === month ? 'selected' : ''}>${moment(month).format('MMMM YYYY')}</option>`;
                });
                filterEl.innerHTML = options;
            },

    renderPage(page, fromPopstate = false) {
                this.currentPage = page;

                // Push to history if navigation is manual (not from back button or initial load)
                if (!fromPopstate && page !== 'dashboard') {
                    history.pushState({ page: page }, "");
                }

                const view = document.getElementById('main-content');
                document.querySelectorAll('.nav-dock .nav-item').forEach(el => el.classList.remove('active'));
                
                const pageMap = {
                    'dashboard': { el: '.nav-dock .nav-item:nth-child(1)', render: () => this.renderDashboard() },
                    'analytics': { el: '.nav-dock .nav-item:nth-child(2)', render: () => this.renderAnalytics(view) },
                    'transactions': { el: '.nav-dock .nav-item:nth-child(4)', render: () => this.renderTransactions(view, 'expense') },
                    'loans': { el: '.nav-item:nth-child(5)', render: () => this.renderLoansPage(view, this.loanPageType) }, // New entry
                    'settings': { el: null, render: () => this.renderSettings(view) } // Settings will be accessed from the user menu
                };
                if (pageMap[page]) {
                    // Check if element exists before adding class
                    if (pageMap[page].el && document.querySelector(pageMap[page].el)) {
                         document.querySelector(pageMap[page].el).classList.add('active');
                    }
                    pageMap[page].render();
                }
                this.updateFAB();
            },

            updateFAB() {
                const fab = document.getElementById('main-fab');
                if (!fab) return;
                
                if (this.currentPage === 'loans') {
                    fab.onclick = () => this.openLoanModal();
                    fab.innerHTML = '<i class="fas fa-hand-holding-usd"></i>';
                } else {
                    fab.onclick = () => this.openTxModal();
                    fab.innerHTML = '<i class="fas fa-plus"></i>';
                }
            },

           renderDashboard() {
                const container = document.getElementById('main-content');
                
                const filteredTxs = State.selectedMonth === 'all' 
                    ? State.txs 
                    : State.txs.filter(t => t.date.startsWith(State.selectedMonth));

                // Exclude transfers from total balance logic, since money just moves within the ecosystem
                const totalBalance = State.txs.reduce((sum, t) => t.type === 'income' ? sum + t.amount : t.type === 'expense' ? sum - t.amount : sum, 0);
                const periodIncome = filteredTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
                const periodExpense = filteredTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

                // Initial render of the main dashboard content
                container.innerHTML = `
                    <div class="balance-card">
                        <div style="font-size:0.8rem; color:rgba(255,255,255,0.7); font-weight:600; letter-spacing:0.5px; text-transform:uppercase;" data-i18n="assets">Total Assets</div>
                        <div class="balance-amount">৳${this.formatMoney(totalBalance)}</div>
                        <div class="stats-row">
                            <div class="stat-pill">
                                <div style="font-size:0.72rem; color:rgba(255,255,255,0.6); font-weight:600; text-transform:uppercase; letter-spacing:0.5px;" data-i18n="inc">Income</div>
                                <div class="pill-val inc-text">৳${this.formatMoney(periodIncome)}</div>
                            </div>
                            <div class="stat-pill">
                                <div style="font-size:0.72rem; color:rgba(255,255,255,0.6); font-weight:600; text-transform:uppercase; letter-spacing:0.5px;" data-i18n="exp">Expense</div>
                                <div class="pill-val exp-text">৳${this.formatMoney(periodExpense)}</div>
                            </div>
                        </div>
                    </div>
                    <div class="section-title">Accounts</div>
                    <div class="account-slider" id="account-slider-container">
                        ${this.renderAccountSkeletons()}
                    </div>
                    <div class="section-title"><span>${Lang.t('tx')}</span><span style="font-size:0.75rem; font-weight:600; color:var(--primary); cursor:pointer; letter-spacing:0;" onclick="UI.renderPage('transactions')">${Lang.t('viewAll')} →</span></div>
                    ${filteredTxs.slice(0, 5).map(t => this.renderTxRow(t)).join('') || `<div style="text-align:center;color:var(--text-muted);padding:2rem 0;font-size:0.9rem;" data-i18n="no_data">No data available</div>`}
                    <div style="height:80px"></div>
                `;
                
                // Now, render the loan card separately
                const totalReceivable = State.loans.filter(l => l.type === 'given' && l.status === 'active').reduce((sum, l) => sum + l.currentBalance, 0);
                const totalPayable = State.loans.filter(l => l.type === 'taken' && l.status === 'active').reduce((sum, l) => sum + l.currentBalance, 0);

                const loanCardHTML = `
                    <div class="section-title" data-i18n="loan_summary">Receivables / Payables</div>
                    <div class="loan-summary-card">
                        <div class="loan-pill">
                            <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;"><div style="width:8px;height:8px;border-radius:50%;background:var(--green);"></div><span class="loan-pill-title" data-i18n="owed_to_you" style="margin:0;">Owed To You</span></div>
                            <div class="loan-pill-amount inc-text">৳${this.formatMoney(totalReceivable)}</div>
                        </div>
                        <div class="loan-pill">
                            <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;"><div style="width:8px;height:8px;border-radius:50%;background:var(--red);"></div><span class="loan-pill-title" data-i18n="you_owe" style="margin:0;">You Owe</span></div>
                            <div class="loan-pill-amount exp-text">৳${this.formatMoney(totalPayable)}</div>
                        </div>
                    </div>`;

                const balanceCard = container.querySelector('.balance-card');
                if (balanceCard) {
                    balanceCard.insertAdjacentHTML('afterend', loanCardHTML);
                }
                
                this.populateAccountCards();

                // FIX: Call this function at the end to apply all translations
                this.updateLangDisplay();
            },


            openNameModal() {
                this.openModal('name-modal');
                // Pre-fill current name
                if (State.user && State.user.displayName) {
                    document.getElementById('new-display-name').value = State.user.displayName;
                }
            },

async saveDisplayName(e) {
    e.preventDefault();
    const newName = document.getElementById('new-display-name').value.trim();
    if (!newName) return;

    try {
        await updateProfile(State.user, { displayName: newName });
        
        // Update UI immediately
        document.getElementById('display-name').innerText = newName;
        this.showNotification("Family Name updated!", "success");
        this.closeModals();
    } catch (error) {
        this.showNotification("Error: " + error.message);
    }
},

            openPassModal() {
                this.openModal('pass-modal');
                document.getElementById('new-password').value = '';
            },

async savePassword(e) {
    e.preventDefault();
    const newPass = document.getElementById('new-password').value;
    const btn = document.getElementById('btn-pass-save');
    
    if (newPass.length < 6) {
        this.showNotification("Password must be at least 6 characters");
        return;
    }

    btn.textContent = "Updating...";
    btn.disabled = true;

    try {
        await updatePassword(State.user, newPass);
        this.showNotification("Password changed successfully!", "success");
        this.closeModals();
    } catch (error) {
        if (error.code === 'auth/requires-recent-login') {
            alert("Security Alert: For sensitive operations like changing passwords, you must have logged in recently.\n\nPlease Log Out and Log In again, then try this immediately.");
        } else {
            this.showNotification("Error: " + error.message);
        }
    } finally {
        btn.textContent = "Update Password";
        btn.disabled = false;
    }
},



      // In window.UI object
updateLoanModalAccountBalance() {
    const accSel = document.getElementById('loan-account');
    const balanceEl = document.getElementById('loan-acc-balance');
    if (!accSel || !balanceEl) return; 

    const accName = accSel.value;
    if (!accName) {
        balanceEl.textContent = '';
        return;
    }

    // FIX: Use UI.getAccountBalance instead of this.getAccountBalance
    const balance = UI.getAccountBalance(accName);
    // FIX: Use UI.formatMoney
    balanceEl.textContent = `Available: ৳${UI.formatMoney(balance)}`;

    const loanAmount = parseFloat(document.getElementById('loan-amount').value) || 0;
    
    // FIX: Use UI.currentLoanType
    const loanType = UI.currentLoanType;

    // Warning logic
    if (loanType === 'given' && loanAmount > balance) {
        balanceEl.style.color = 'var(--accent-red)';
    } else {
        balanceEl.style.color = 'var(--text-tertiary)';
    }
},

             // NEW: Render the main Loans page
           renderLoansPage(container, type) {
            this.loanPageType = type;
            const filteredLoans = State.loans.filter(l => l.type === type).sort((a,b) => (a.status > b.status) ? 1 : -1);

            container.innerHTML = `
                <div class="section-title">
                    <span data-i18n="loan_management">Loan Management</span>
                </div>
                <div class="segment-control">
                    <div class="segment-tab ${type==='taken'?'active':''}" onclick="UI.renderLoansPage(document.getElementById('main-content'), 'taken')" data-i18n="you_owe">Payables (You Owe)</div>
                    <div class="segment-tab ${type==='given'?'active':''}" onclick="UI.renderLoansPage(document.getElementById('main-content'), 'given')" data-i18n="owed_to_you">Receivables (Owed to You)</div>
                </div>
                <div id="loan-list">
                    ${filteredLoans.map(l => this.renderLoanCard(l)).join('') || `<div style="text-align:center;color:var(--text-muted);padding:2rem 0;font-size:0.9rem;" data-i18n="no_data">No loans found.</div>`}
                </div>
                <div style="height:80px"></div>
            `;
            this.updateLangDisplay(); // Ensure translations are applied
        },
            
          renderLoanCard(loan) {
    const progress = ((loan.initialAmount - loan.currentBalance) / loan.initialAmount) * 100;
    const loanObjectString = JSON.stringify(loan).replace(/"/g, '&quot;');
    
    // FIX: Format the date correctly (prevent NAN)
    let displayDate = moment(loan.loanDate).format('DD/MM/YYYY');
    
    // Convert date numbers to Bengali if language is BN
    if (Lang.current === 'bn') {
        const map = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' };
        displayDate = displayDate.replace(/\d/g, m => map[m]);
    }

    return `
    <div class="loan-card ${loan.status}">
        <div class="loan-card-header">
            <span class="loan-person">${loan.personName}</span>
            <span class="loan-date">${displayDate}</span>
        </div>
        <div class="loan-balance-row">
            <span data-i18n="remaining_balance">Remaining</span>
            <span class="loan-balance">৳${this.formatMoney(loan.currentBalance)} / ৳${this.formatMoney(loan.initialAmount)}</span>
        </div>
        <div class="progress-bar-bg">
            <div class="progress-bar-fg" style="width:${progress}%; background: ${loan.type === 'taken' ? 'var(--accent-red)' : 'var(--accent-green)'};"></div>
        </div>
        ${loan.status === 'active' ? `
        <div class="loan-card-footer">
            <button class="btn-settle" onclick='UI.openSettleModal(${loanObjectString})' data-i18n="make_payment">Make Payment</button>
        </div>` : ''}
    </div>`;
},



        // Add this inside window.UI object, preferably near updateLoanModalAccountBalance
updateSettleModalAccountBalance() {
    const accSel = document.getElementById('settle-account');
    const balanceEl = document.getElementById('settle-acc-balance');
    
    if (!accSel || !balanceEl) return;

    const accName = accSel.value;
    const balance = UI.getAccountBalance(accName);
    
    balanceEl.textContent = `Available: ৳${UI.formatMoney(balance)}`;

    const amount = parseFloat(document.getElementById('settle-amount').value) || 0;
    const loanType = document.getElementById('settle-loan-type').value; // 'taken' or 'given'

    // Logic: If I took a loan, I am paying it back (Expense). I need money in my account.
    // If I gave a loan, I am receiving money (Income). Balance warning not needed for Income.
    
    if (loanType === 'taken' && amount > balance) {
        balanceEl.style.color = 'var(--accent-red)';
    } else {
        balanceEl.style.color = 'var(--text-tertiary)';
    }
},

               // --- Modal Logic ---
           // In window.UI object
        openLoanModal() {
            this.openModal('loan-modal');
            document.getElementById('loan-form').reset();
            document.getElementById('loan-date').valueAsDate = new Date();
            
            // Render chips
            this.renderAccountSelector('loan-account-chips', 'loan-account', null, 'updateLoanModalAccountBalance');
            
            this.setLoanType('taken'); // Set default type
            this.updateLoanModalAccountBalance(); 
        },

          // In window.UI object
        setLoanType(type) {
            this.currentLoanType = type;
            document.getElementById('loan-tab-taken').className = type==='taken'?'segment-tab active':'segment-tab';
            document.getElementById('loan-tab-given').className = type==='given'?'segment-tab active':'segment-tab';

            // NEW: Call this to update the balance display and its color logic
            this.updateLoanModalAccountBalance();
        },

               async saveLoan() {
                const type = this.currentLoanType;
                const personName = document.getElementById('loan-person').value;
                const amount = parseFloat(document.getElementById('loan-amount').value);
                const loanDate = document.getElementById('loan-date').value;
                const account = document.getElementById('loan-account').value;

                if (!account) {
                    this.showNotification('Please select an account.');
                    return;
                }

                if (type === 'given') {
                    const accountBalance = this.getAccountBalance(account);
                    if (amount > accountBalance) {
                        // This call will now work correctly
                        this.showNotification(`Cannot give loan. Insufficient balance in ${account}.`);
                        return;
                    }
                }

                const loanData = { type, personName, initialAmount: amount, currentBalance: amount, loanDate, status: 'active' };
                const txData = {
                    amount, account, date: loanDate,
                    type: type === 'taken' ? 'income' : 'expense',
                    category: 'Loan',
                    note: type === 'taken' ? `Loan from ${personName}` : `Loan to ${personName}`
                };

                await Data.addLoanAndTransaction(loanData, txData);
                // This call will now work correctly
                this.showNotification('Loan saved successfully!', 'success');
                this.closeModals();
            },

          openSettleModal(loan) {
    this.openModal('settle-modal');
    document.getElementById('settle-form').reset();
    
    document.getElementById('settle-loan-id').value = loan.id;
    document.getElementById('settle-loan-type').value = loan.type;
    document.getElementById('settle-loan-person').value = loan.personName;
    
    document.getElementById('settle-info').innerHTML = `
        <div>Paying to/from: <strong>${loan.personName}</strong></div>
        <div style="font-size:0.9rem; color:var(--text-secondary);">Remaining Balance: ৳${this.formatMoney(loan.currentBalance)}</div>
    `;
    document.getElementById('settle-amount').max = loan.currentBalance;
    
    // Render chips
    this.renderAccountSelector('settle-account-chips', 'settle-account', null, 'updateSettleModalAccountBalance');

    // NEW: Trigger balance update immediately so it shows up when modal opens
    this.updateSettleModalAccountBalance();
},


                 async saveSettlement() {
                const loanId = document.getElementById('settle-loan-id').value;
                const loanType = document.getElementById('settle-loan-type').value;
                const personName = document.getElementById('settle-loan-person').value;
                const amount = parseFloat(document.getElementById('settle-amount').value);
                const account = document.getElementById('settle-account').value;

                if (!loanId || !amount || amount <= 0) {
                    this.showNotification('Please enter a valid amount.');
                    return;
                }

                if (!account) {
                    this.showNotification('Please select an account.');
                    return;
                }

                if (loanType === 'taken') {
                    const accountBalance = this.getAccountBalance(account);
                    if (amount > accountBalance) {
                        this.showNotification(`Cannot repay. Insufficient balance in ${account}.`);
                        return;
                    }
                }
                
                const settlementDate = new Date().toISOString().slice(0, 10);
                const settlementData = { amount, settlementDate };
                
                // FIX: The txData object is now fully defined
                const txData = {
                    amount, 
                    account, 
                    date: settlementDate,
                    type: loanType === 'taken' ? 'expense' : 'income',
                    category: 'Loan Settlement',
                    note: loanType === 'taken' ? `Repayment to ${personName}` : `Repayment from ${personName}`
                };

                await Data.addSettlementAndUpdateLoan(loanId, settlementData, txData);
                this.showNotification('Payment added!', 'success');
                this.closeModals();
            },

            


            renderAccountSkeletons() {
                let skeletons = '';
                for (let i = 0; i < 3; i++) {
                    skeletons += `
                    <div class="acc-card">
                        <div style="width:36px; height:36px; background:var(--bg-input); border-radius:10px;"></div>
                        <div><div style="height:10px; width:70px; background:var(--bg-input); border-radius:5px; margin-bottom:6px;"></div>
                             <div style="height:16px; width:55px; background:var(--bg-input); border-radius:5px;"></div></div>
                    </div>`;
                }
                return skeletons;
            },

          // in window.UI object
            populateAccountCards() {
                const container = document.getElementById('account-slider-container');
                if (!container) return;

                // Step 1: Create a new array of accounts with their current balances.
                const accountsWithBalances = State.accounts.map(acc => ({
                    ...acc, // a copy of the original account object {id, name}
                    balance: this.getAccountBalance(acc.name)
                }));

                // Step 2: Sort this new array by balance in descending order.
                accountsWithBalances.sort((a, b) => b.balance - a.balance);

                // Step 3: Generate the HTML from the sorted array, applying the conditional class.
                const accIcons = {'Cash':'fa-money-bill-wave','bKash':'fa-mobile-alt','Bank':'fa-university','Nagad':'fa-mobile-alt','Rocket':'fa-rocket'};
                const accColors = ['#5a5fe0','#7c6dd8','#22c55e','#f59e0b','#ef4444','#3b82f6','#8b5cf6'];

                const accountHtml = accountsWithBalances.map((acc, i) => {
                    const icon = accIcons[acc.name] || 'fa-wallet';
                    const color = accColors[i % accColors.length];
                    return `
                    <div class="acc-card ${acc.balance === 0 ? 'zero-balance' : ''}">
                        <div class="acc-icon-box" style="background:${color}12;color:${color};"><i class="fas ${icon}"></i></div>
                        <div>
                            <div class="acc-name">${acc.name}</div>
                            <div class="acc-bal">৳${this.formatMoney(acc.balance)}</div>
                        </div>
                    </div>`;
                }).join('');

                container.innerHTML = accountHtml + `
                    <div class="acc-card" style="min-width:56px; display:grid; place-items:center; border:2px dashed var(--border-hover); box-shadow:none; cursor:pointer;" onclick="UI.openManageModal('account')">
                        <i class="fas fa-plus" style="color:var(--text-muted); font-size:1rem;"></i>
                    </div>
                `;
            },
            
        renderAnalytics(container) {
                container.innerHTML = `
                    <div class="ai-card">
                        <div class="ai-header"><i class="fas fa-sparkles"></i> ${Lang.t('ai_opinion')}</div>
                        <div id="ai-text-result" class="ai-text">
                            Get a smart summary of your financial activity for the current month.
                        </div>
                    </div>

                    <div class="section-title"><span>${Lang.t('analytics')}</span><input type="month" value="${moment().format('YYYY-MM')}" class="month-selector" onchange="UI.updateCharts(this.value)"></div>
                    <div style="background:var(--bg-card); padding:16px; border-radius:var(--r-lg); height:250px; margin-bottom:12px; border:1px solid var(--border); box-shadow:var(--shadow-card);"><canvas id="lineChart"></canvas></div>
                    <div style="background:var(--bg-card); padding:16px; border-radius:var(--r-lg); height:250px; border:1px solid var(--border); box-shadow:var(--shadow-card);"><canvas id="catChart"></canvas></div>
                    <div style="height:80px"></div>
                `;
                // We call this immediately to show advice when the page loads
                this.displaySmartAdvice(); 
                setTimeout(() => this.updateCharts(moment().format('YYYY-MM')), 50);
            },
          

               displaySmartAdvice() {
                const resultEl = document.getElementById('ai-text-result');
                resultEl.textContent = 'Analyzing...';

                // Step 1: Gather all the necessary data
                const currentMonth = moment().format('YYYY-MM');
                const filteredTxs = State.txs.filter(t => t.date.startsWith(currentMonth));
                
                if (filteredTxs.length === 0) {
                    resultEl.textContent = Lang.t('no_data');
                    return;
                }

                const income = filteredTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
                const expense = filteredTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

                const expCats = {};
                filteredTxs.forEach(t => {
                    if (t.type === 'expense') expCats[t.category] = (expCats[t.category] || 0) + t.amount;
                });
                
                const topCategory = Object.entries(expCats).sort(([, a], [, b]) => b - a)[0]; // [name, amount]
                const savingsRate = income > 0 ? (((income - expense) / income) * 100) : -100;

                const adviceData = {
                    savingsRate: savingsRate.toFixed(1),
                    topCategoryName: topCategory ? topCategory[0] : 'None',
                    topCategoryAmount: topCategory ? topCategory[1] : 0,
                    totalExpense: expense
                };

                // Step 2: Generate and display the advice
                resultEl.textContent = this.generateSmartAdvice(adviceData);
            },

               generateSmartAdvice(data) {
                const isBengali = Lang.current === 'bn';
                let overview = '';
                let tip = '';

                // Part 1: Generate the overview based on savings rate
                if (data.savingsRate > 25) {
                    overview = isBengali 
                        ? `চমৎকার! এই মাসে আপনি আয়ের ${data.savingsRate}% সঞ্চয় করছেন, যা অসাধারণ।` 
                        : `Excellent! You're saving ${data.savingsRate}% of your income this month, which is fantastic.`;
                } else if (data.savingsRate > 10) {
                    overview = isBengali 
                        ? `খুব ভালো! ${data.savingsRate}% সঞ্চয়ের হার একটি স্বাস্থ্যকর আর্থিক অভ্যাস। চালিয়ে যান!` 
                        : `Very good! A savings rate of ${data.savingsRate}% is a healthy financial habit. Keep it up!`;
                } else if (data.savingsRate >= 0) {
                    overview = isBengali 
                        ? `আপনি সঠিক পথেই আছেন, তবে উন্নতির সুযোগ আছে। এই মাসে আপনার সঞ্চয়ের হার ${data.savingsRate}%।` 
                        : `You're on the right track, but there's room for improvement. Your savings rate this month is ${data.savingsRate}%.`;
                } else {
                    overview = isBengali 
                        ? `সতর্কতা: এই মাসে আপনার আয় থেকে ব্যয় বেশি হয়েছে। আর্থিক পরিকল্পনা পর্যালোচনা করা প্রয়োজন।` 
                        : `Warning: Your expenses were higher than your income this month. It's important to review your budget.`;
                }

                // Part 2: Generate a specific tip based on the top expense category
                if (data.totalExpense > 0 && data.topCategoryName !== 'None') {
                    const topCategoryPercent = ((data.topCategoryAmount / data.totalExpense) * 100).toFixed(0);
                    const nonEssentialCategories = ['Shopping', 'Entertainment', 'Food', 'Transport'];

                    if (nonEssentialCategories.includes(data.topCategoryName) && topCategoryPercent > 20) {
                         tip = isBengali
                            ? `আপনার ব্যয়ের একটি বড় অংশ (${topCategoryPercent}%) '${data.topCategoryName}' ক্যাটাগরিতে যাচ্ছে। এই খাতে সামান্য কমালে সঞ্চয় অনেক বাড়বে।`
                            : `A significant portion (${topCategoryPercent}%) of your spending is on '${data.topCategoryName}'. Reducing this slightly could boost your savings significantly.`
                    } else {
                         tip = isBengali
                            ? `আপনার সবচেয়ে বড় ব্যয়ের খাত হলো '${data.topCategoryName}'। এই ক্যাটাগরির খরচগুলো পর্যালোচনা করে দেখতে পারেন কোনো সাশ্রয়ের সুযোগ আছে কিনা।`
                            : `Your biggest expense category is '${data.topCategoryName}'. It might be helpful to review these costs to see if there are any saving opportunities.`
                    }
                }
                
                return `${overview} ${tip}`;
            },


           updateCharts(monthStr) {
                // FIX: Destroy previous chart instances to prevent rendering bugs and memory leaks
                if(this.lineChartInstance) {
                    this.lineChartInstance.destroy();
                }
                if(this.catChartInstance) {
                    this.catChartInstance.destroy();
                }
                
                const filtered = State.txs.filter(t => t.date.startsWith(monthStr));
                const expCats = {};
                const days = {};
                
                // Process data for the selected month
                filtered.forEach(t => {
                    if (t.type === 'transfer') return; // Ignore transfers for charts
                    if(t.type === 'expense') {
                        expCats[t.category] = (expCats[t.category] || 0) + t.amount;
                    }
                    const day = t.date.slice(-2); // Get the day part of the date 'YYYY-MM-DD'
                    if(!days[day]) {
                        days[day] = { inc: 0, exp: 0 };
                    }
                    if(t.type === 'income') {
                        days[day].inc += t.amount;
                    } else {
                        days[day].exp += t.amount;
                    }
                });

                // Render Bar Chart (Daily Income/Expense)
                const ctxLine = document.getElementById('lineChart');
                if(ctxLine) {
                    const sortedDays = Object.keys(days).sort();
                    this.lineChartInstance = new Chart(ctxLine, {
                        type: 'bar',
                        data: {
                            labels: sortedDays,
                            datasets: [
                                { label: 'Expense', data: sortedDays.map(d => days[d].exp), backgroundColor: '#ef4444', borderRadius: 6 },
                                { label: 'Income', data: sortedDays.map(d => days[d].inc), backgroundColor: '#22c55e', borderRadius: 6 }
                            ]
                        },
                        options: { 
                            responsive: true, 
                            maintainAspectRatio: false, 
                            scales: { 
                                x: { ticks: { color: '#9ca3af', font: {size: 11, weight: 500} }, grid: { display: false } }, 
                                y: { display: false, grid: { display: false } } 
                            }, 
                            plugins: { 
                                legend: { display: true, position: 'bottom', labels: { color: '#6b7280', font: {size: 12, weight: 600}, padding: 16 } } 
                            } 
                        }
                    });
                }
                
                // Render Doughnut Chart (Expense by Category)
                const ctxCat = document.getElementById('catChart');
                if(ctxCat) {
                     this.catChartInstance = new Chart(ctxCat.getContext('2d'), {
                        type: 'doughnut',
                        data: {
                            labels: Object.keys(expCats),
                            datasets: [{ 
                                data: Object.values(expCats), 
                                backgroundColor: ['#5a5fe0', '#22c55e', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'], 
                                borderWidth: 0 
                            }]
                        },
                        options: { 
                            responsive: true, 
                            maintainAspectRatio: false, 
                            cutout: '65%',
                            plugins: { 
                                legend: { 
                                    position: 'right', 
                                    labels: { color: '#6b7280', boxWidth: 10, padding: 12, font: {size: 12, weight: 600} } 
                                } 
                            } 
                        }
                    });
                }
            },

            // FIX: RESTORED & ENHANCED FUNCTION
       renderTransactions(container, type) {
                container.innerHTML = `
                    <div class="section-title">${Lang.t('tx')}</div>
                    <div style="position:relative;">
                        <i class="fas fa-search" style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--text-muted);font-size:0.85rem;"></i>
                        <input 
                            type="search" 
                            id="tx-search" 
                            class="search-bar" 
                            style="padding-left:38px;"
                            placeholder="Search by category, account, note..." 
                            oninput="UI.filterTransactions()"
                        >
                    </div>
                    <div class="segment-control">
                        <div class="segment-tab ${type==='income'?'active':''}" onclick="UI.renderTransactions(document.getElementById('main-content'), 'income')">${Lang.t('income_log')}</div>
                        <div class="segment-tab ${type==='expense'?'active':''}" onclick="UI.renderTransactions(document.getElementById('main-content'), 'expense')">${Lang.t('expense_log')}</div>
                    </div>
                    <div id="transactions-list"></div>
                    <div style="height:80px"></div>
                `;
                // This initial call populates the list
                this.filterTransactions();
            },

    filterTransactions() { // NEW: Search and render logic for transactions
                const listEl = document.getElementById('transactions-list');
                const searchEl = document.getElementById('tx-search');
                if (!listEl) return;
                
                const searchTerm = searchEl ? searchEl.value.toLowerCase() : '';
                const activeType = document.querySelector('.segment-tab.active').textContent === Lang.t('income_log') ? 'income' : 'expense';
                
                const filteredByMonth = State.selectedMonth === 'all' ? State.txs : State.txs.filter(t => t.date.startsWith(State.selectedMonth));
                
                let filteredTxs = filteredByMonth.filter(t => {
                    const matchType = t.type === activeType;
                    const matchSearch = searchTerm === '' || 
                        t.category.toLowerCase().includes(searchTerm) ||
                        t.account.toLowerCase().includes(searchTerm) ||
                        (t.note && t.note.toLowerCase().includes(searchTerm)) ||
                        t.amount.toString().includes(searchTerm) ||
                        t.date.includes(searchTerm);
                    return matchType && matchSearch;
                });
                
                listEl.innerHTML = filteredTxs.map(t => this.renderTxRow(t)).join('') || `<div style="text-align:center;color:var(--text-muted);padding:2rem 0;font-size:0.9rem;">${Lang.t('no_data')}</div>`;
            },
            
            getCatIcon(category) {
                const icons = {
                    'Bazar':'fa-shopping-basket','Transport':'fa-bus','Utilities':'fa-bolt','Shopping':'fa-bag-shopping',
                    'Health':'fa-heart-pulse','Food':'fa-utensils','Entertainment':'fa-film','Salary':'fa-briefcase',
                    'Business':'fa-chart-line','Bonus':'fa-gift','Gift':'fa-gift','Loan':'fa-handshake',
                    'Loan Settlement':'fa-hand-holding-dollar','Transfer':'fa-exchange-alt',
                };
                return icons[category] || (category ? 'fa-receipt' : 'fa-receipt');
            },

            renderTxRow(t) {
                const txObjectString = JSON.stringify(t).replace(/"/g, '&quot;');
                const icon = this.getCatIcon(t.category);
                const isTransfer = t.type === 'transfer';
                const accountDisplay = isTransfer ? `${t.account} → ${t.toAccount}` : t.account;
                const amtSymbol = isTransfer ? '' : (t.type === 'income' ? '+' : '-');
                const amtClass = isTransfer ? 'text-primary' : (t.type === 'income' ? 'inc-text' : 'exp-text');
                
                return `<div class="log-item ${t.type}">
                    <div class="log-cat-icon ${t.type}"><i class="fas ${icon}"></i></div>
                    <div style="flex:1; min-width:0;">
                        <div style="font-weight:700; font-size:0.9rem; color:var(--text-primary); letter-spacing:-0.01em;">${t.category}</div>
                        <div class="log-date">${accountDisplay} • ${t.date}${t.note ? ' • ' + t.note : ''}</div>
                    </div>
                    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
                        <div class="log-amt ${amtClass}">${amtSymbol}৳${this.formatMoney(t.amount)}</div>
                        <div class="log-actions">
                            <i class="fas fa-pen" onclick='UI.editTransaction(${txObjectString})'></i>
                            <i class="fas fa-trash" onclick="UI.deleteTransaction('${t.id}')"></i>
                        </div>
                    </div>
                </div>`;
            },
            
            // NEW: Functions to handle transaction editing and deletion
            async deleteTransaction(id) {
                if (confirm('Are you sure you want to delete this transaction?')) {
                    await Data.deleteMeta('transactions', id);
                }
            },
            editTransaction(tx) {
                this.openTxModal(tx); // Open modal and pass the transaction object
            },

           renderSettings(container) {
      container.innerHTML = `
        <div class="section-title">${Lang.t('profile_settings')}</div>
        
        <div class="setting-item" onclick="UI.openNameModal()">
            <div class="setting-item-left">
                <div class="setting-icon" style="background:#dbeafe;color:#3b82f6;"><i class="fas fa-user-edit"></i></div>
                <div style="font-weight:600;font-size:0.92rem;">${Lang.t('change_name')}</div>
            </div>
            <i class="fas fa-chevron-right" style="color:var(--text-muted);font-size:0.8rem;"></i>
        </div>

        <div class="setting-item" onclick="UI.openPassModal()">
            <div class="setting-item-left">
                <div class="setting-icon" style="background:#fef3c7;color:#f59e0b;"><i class="fas fa-lock"></i></div>
                <div style="font-weight:600;font-size:0.92rem;">${Lang.t('change_pass')}</div>
            </div>
            <i class="fas fa-chevron-right" style="color:var(--text-muted);font-size:0.8rem;"></i>
        </div>

        <div style="height:8px;"></div>
        <div class="section-title">${Lang.t('data_mgmt')}</div>

        <div class="setting-item" onclick="UI.openManageModal('account')">
            <div class="setting-item-left">
                <div class="setting-icon" style="background:#ede9fe;color:#7c3aed;"><i class="fas fa-wallet"></i></div>
                <div style="font-weight:600;font-size:0.92rem;">${Lang.t('add_acc')}</div>
            </div>
            <i class="fas fa-chevron-right" style="color:var(--text-muted);font-size:0.8rem;"></i>
        </div>
        <div class="setting-item" onclick="UI.openManageModal('category')">
            <div class="setting-item-left">
                <div class="setting-icon" style="background:#fce7f3;color:#ec4899;"><i class="fas fa-tags"></i></div>
                <div style="font-weight:600;font-size:0.92rem;">${Lang.t('add_cat')}</div>
            </div>
            <i class="fas fa-chevron-right" style="color:var(--text-muted);font-size:0.8rem;"></i>
        </div>
        <div class="setting-item" onclick="UI.exportCSV()">
            <div class="setting-item-left">
                <div class="setting-icon" style="background:var(--green-bg);color:var(--green);"><i class="fas fa-file-csv"></i></div>
                <div>
                    <div style="font-weight:600;font-size:0.92rem;">${Lang.t('export')}</div>
                    <div style="font-size:0.72rem; color:var(--text-muted); font-weight:500;">Applies current month filter</div>
                </div>
            </div>
            <i class="fas fa-download" style="color:var(--text-muted);font-size:0.85rem;"></i>
        </div>

        <div style="height:12px;"></div>
        <button class="btn-danger" onclick="UI.resetData()"><i class="fas fa-exclamation-triangle" style="margin-right:6px;"></i>${Lang.t('reset_data')}</button>
        <div style="height:80px"></div>
    `;
},

            // NEW: Handler for reset button
            async resetData() {
                if (confirm('WARNING: This will delete ALL transactions, accounts, and categories. This cannot be undone. Are you sure?')) {
                    await Data.resetAllData();
                    alert('Data has been reset.');
                }
            },
            exportCSV() {
                const filtered = State.selectedMonth === 'all'
                    ? State.txs
                    : State.txs.filter(t => t.date.startsWith(State.selectedMonth));

                if(filtered.length === 0) return alert("No data for the selected period.");
                let csv = "Date,Type,Category,Amount,Account,Note\n";
                filtered.forEach(t => csv += `${t.date},${t.type},${t.category},${t.amount},${t.account},"${t.note || ''}"\n`);
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = `FamilyFin_${State.selectedMonth}.csv`; a.click();
            },

            /* --- MODALS --- */
            renderAccountSelector(containerId, hiddenInputId, excludeAccount = null, onChangeCallback = null) {
                const container = document.getElementById(containerId);
                if (!container) return;
                
                const accountsWithBalances = State.accounts.map(acc => ({
                    name: acc.name,
                    balance: UI.getAccountBalance(acc.name)
                })).sort((a, b) => b.balance - a.balance);

                let html = '';
                accountsWithBalances.forEach(acc => {
                    if (acc.name === excludeAccount) return;
                    const balString = `৳${UI.formatMoney(acc.balance)}`;
                    const icon = acc.name.toLowerCase().includes('cash') ? 'fa-money-bill-wave' : 'fa-university';
                    html += `<div class="chip account-chip" data-val="${acc.name}" onclick="UI.selectAccountChip('${containerId}', '${hiddenInputId}', '${acc.name}', ${onChangeCallback ? "'" + onChangeCallback + "'" : 'null'})">
                        <i class="fas ${icon}" style="font-size:0.8rem; opacity:0.7;"></i>
                        <span>${acc.name}</span>
                        <span class="chip-bal" style="font-size:0.7rem; opacity:0.8; margin-left:4px;">(${balString})</span>
                    </div>`;
                });
                html += `<div class="chip account-chip" onclick="UI.openQuickAddModal('account')" style="border-style:dashed; color:var(--primary);">
                        <i class="fas fa-plus" style="font-size:0.8rem; opacity:0.7;"></i>
                        <span>New</span>
                    </div>`;
                container.innerHTML = html;
                document.getElementById(hiddenInputId).value = ''; // Reset value (no default selection)
            },

            selectAccountChip(containerId, hiddenInputId, val, callbackStr) {
                document.querySelectorAll(`#${containerId} .account-chip`).forEach(c => c.classList.remove('active'));
                const chip = document.querySelector(`#${containerId} .account-chip[data-val="${val}"]`);
                if (chip) chip.classList.add('active');
                document.getElementById(hiddenInputId).value = val;
                
                if (containerId === 'tx-account-chips' && this.currentTxType === 'transfer') {
                    this.renderAccountSelector('tx-to-account-chips', 'tx-to-account', val, 'updateModalAccountBalance');
                    document.getElementById('tx-to-account-container').classList.remove('hidden');
                }
                
                if (callbackStr && typeof this[callbackStr] === 'function') {
                    this[callbackStr]();
                } else {
                    const event = new Event('change');
                    document.getElementById(hiddenInputId).dispatchEvent(event);
                }
                this.updateSaveButtonText();
            },

            updateModalAccountBalance() {
                const accName = document.getElementById('tx-account').value;
                const balanceEl = document.getElementById('tx-acc-balance');
                const toAccName = document.getElementById('tx-to-account').value;
                
                // Helper to calculate effective balance taking bulk pending items into account
                const getEffectiveBal = (accountName) => {
                    const bal = UI.getAccountBalance(accountName);
                    const pendingOut = UI.bulkTxs.filter(t => t.account === accountName && (t.type === 'expense' || t.type === 'transfer')).reduce((s, t) => s + t.amount, 0);
                    const pendingIn = UI.bulkTxs.filter(t => (t.account === accountName && t.type === 'income') || (t.type === 'transfer' && t.toAccount === accountName)).reduce((s, t) => s + t.amount, 0);
                    return bal - pendingOut + pendingIn;
                };

                // Update ALL chips in from and to containers with effective balance
                ['tx-account-chips', 'tx-to-account-chips'].forEach(containerId => {
                    document.querySelectorAll(`#${containerId} .account-chip`).forEach(chip => {
                        const chipAccName = chip.getAttribute('data-val');
                        const effectiveBal = getEffectiveBal(chipAccName);
                        const balSpan = chip.querySelector('.chip-bal');
                        if(balSpan) balSpan.textContent = `(৳${UI.formatMoney(effectiveBal)})`;
                    });
                });

                if (!balanceEl) return;
                if (!accName) {
                    balanceEl.textContent = '';
                    return;
                }
                
                const effectiveBal = getEffectiveBal(accName);
                const amount = parseFloat(document.getElementById('tx-amount').value) || 0;
                let nextBal = effectiveBal;
                
                if (UI.currentTxType === 'expense' || UI.currentTxType === 'transfer') {
                    nextBal -= amount;
                } else if (UI.currentTxType === 'income') {
                    nextBal += amount;
                }

                const saveBtn = document.getElementById('save-btn');

                if ((UI.currentTxType === 'expense' || UI.currentTxType === 'transfer') && amount > effectiveBal) {
                    balanceEl.style.color = 'var(--accent-red)';
                    balanceEl.textContent = `Insufficient Balance! (Available: ৳${UI.formatMoney(effectiveBal)})`;
                    saveBtn.disabled = true;
                } else {
                    balanceEl.style.color = 'var(--text-tertiary)';
                    balanceEl.textContent = `Next Balance: ৳${UI.formatMoney(nextBal)}`;
                    saveBtn.disabled = false;
                }
            },

            updateLoanModalAccountBalance() {
                const accName = document.getElementById('loan-account').value;
                const balanceEl = document.getElementById('loan-acc-balance');
                if (!balanceEl) return;
                
                // Update chip balances
                document.querySelectorAll('#loan-account-chips .account-chip').forEach(chip => {
                    const chipAccName = chip.getAttribute('data-val');
                    const bal = UI.getAccountBalance(chipAccName);
                    const balSpan = chip.querySelector('.chip-bal');
                    if(balSpan) balSpan.textContent = `(৳${UI.formatMoney(bal)})`;
                });

                if (!accName) {
                    balanceEl.textContent = '';
                    return;
                }
                
                const balance = UI.getAccountBalance(accName);
                const amount = parseFloat(document.getElementById('loan-amount').value) || 0;
                let nextBal = balance;
                
                if (UI.currentLoanType === 'given') {
                    nextBal -= amount;
                } else if (UI.currentLoanType === 'taken') {
                    nextBal += amount;
                }

                if (UI.currentLoanType === 'given' && amount > balance) {
                    balanceEl.style.color = 'var(--accent-red)';
                    balanceEl.textContent = `Insufficient Balance! (Available: ৳${UI.formatMoney(balance)})`;
                } else {
                    balanceEl.style.color = 'var(--text-tertiary)';
                    balanceEl.textContent = `Next Balance: ৳${UI.formatMoney(nextBal)}`;
                }
            },

            updateSettleModalAccountBalance() {
                const accName = document.getElementById('settle-account').value;
                const balanceEl = document.getElementById('settle-acc-balance');
                if (!balanceEl) return;
                
                // Update chip balances
                document.querySelectorAll('#settle-account-chips .account-chip').forEach(chip => {
                    const chipAccName = chip.getAttribute('data-val');
                    const bal = UI.getAccountBalance(chipAccName);
                    const balSpan = chip.querySelector('.chip-bal');
                    if(balSpan) balSpan.textContent = `(৳${UI.formatMoney(bal)})`;
                });

                if (!accName) {
                    balanceEl.textContent = '';
                    return;
                }
                
                const balance = UI.getAccountBalance(accName);
                const amount = parseFloat(document.getElementById('settle-amount').value) || 0;
                const loanType = document.getElementById('settle-loan-type').value;
                let nextBal = balance;
                
                if (loanType === 'taken') { // repayment from my account
                    nextBal -= amount;
                } else if (loanType === 'given') { // receiving money into my account
                    nextBal += amount;
                }

                if (loanType === 'taken' && amount > balance) {
                    balanceEl.style.color = 'var(--accent-red)';
                    balanceEl.textContent = `Insufficient Balance! (Available: ৳${UI.formatMoney(balance)})`;
                } else {
                    balanceEl.style.color = 'var(--text-tertiary)';
                    balanceEl.textContent = `Next Balance: ৳${UI.formatMoney(nextBal)}`;
                }
            },

            getTxFormData(silent = false) {
                const amount = parseFloat(document.getElementById('tx-amount').value);
                const account = document.getElementById('tx-account').value;
                const category = document.getElementById('tx-category').value;
                const date = document.getElementById('tx-date').value;
                const note = document.getElementById('tx-note').value;
                const type = this.currentTxType;

                if (!amount || amount <= 0) {
                    if (!silent) this.showNotification("Please enter a valid amount.");
                    return null;
                }
                if (!account) {
                    if (!silent) this.showNotification("Please select an account.");
                    return null;
                }
                
                const txData = { type, amount, account, category, date, note };

                if (type === 'transfer') {
                    txData.toAccount = document.getElementById('tx-to-account').value;
                    if (!txData.toAccount) {
                        if (!silent) this.showNotification("Please select a destination account.");
                        return null;
                    }
                    if (txData.account === txData.toAccount) {
                        if (!silent) this.showNotification("Cannot transfer to the same account.");
                        return null;
                    }
                }

                // Balance check for this individual item
                const bal = this.getAccountBalance(account);
                // Important: If we have multiple pending items from the SAME account, we should ideally check cumulative balance,
                // but for now let's keep it simple or do a quick cumulative check against State.bulkTxs
                const pendingOutFromThisAcc = this.bulkTxs
                    .filter(t => t.account === account && (t.type === 'expense' || t.type === 'transfer'))
                    .reduce((s, t) => s + t.amount, 0);

                if ((type === 'expense' || type === 'transfer') && amount > (bal - pendingOutFromThisAcc)) {
                    if (!silent) this.showNotification(`Insufficient balance in ${account} (including pending items).`);
                    return null;
                }

                return txData;
            },

            addToBulk() {
                const tx = this.getTxFormData();
                if (!tx) return;

                this.bulkTxs.push(tx);
                this.renderBulkList();
                
                // Reset fields for next entry
                document.getElementById('tx-amount').value = '';
                document.getElementById('tx-note').value = '';
                // Keep account, date for efficiency
                this.showNotification("Added to list", "success");
            },

            renderBulkList() {
                const container = document.getElementById('bulk-list-container');
                const itemsDiv = document.getElementById('bulk-items');
                const countBadge = document.getElementById('bulk-count');
                const saveBtn = document.getElementById('save-btn');

                if (this.bulkTxs.length === 0) {
                    container.classList.add('hidden');
                    saveBtn.textContent = Lang.t('save');
                    return;
                }

                container.classList.remove('hidden');
                countBadge.textContent = this.bulkTxs.length;
                saveBtn.textContent = `Save All (${this.bulkTxs.length + (this.getTxFormData(true) ? 1 : 0)})`;

                itemsDiv.innerHTML = this.bulkTxs.map((tx, i) => `
                    <div class="pending-tx">
                        <div class="pending-details">
                            <div class="pending-cat">${tx.type === 'transfer' ? 'Transfer' : tx.category}</div>
                            <div class="pending-meta">${tx.account} ${tx.type === 'transfer' ? '→ ' + tx.toAccount : ''}</div>
                        </div>
                        <div style="display:flex; align-items:center; gap:10px;">
                            <div class="pending-amt ${tx.type === 'income' ? 'inc-text' : 'exp-text'}">${tx.type === 'income' ? '+' : '-'}৳${this.formatMoney(tx.amount)}</div>
                            <i class="fas fa-times-circle" style="color:var(--text-muted); cursor:pointer;" onclick="UI.removeBulkItem(${i})"></i>
                        </div>
                    </div>
                `).join('');
                
                // Add listener to amount field to update "Save All" total count dynamically
                document.getElementById('tx-amount').oninput = () => {
                    this.updateSaveButtonText();
                    this.updateModalAccountBalance();
                };
            },

            updateSaveButtonText() {
                const saveBtn = document.getElementById('save-btn');
                const extra = this.getTxFormData(true) ? 1 : 0;
                const total = this.bulkTxs.length + extra;
                
                if (this.bulkTxs.length === 0) {
                    saveBtn.textContent = 'Save Single';
                } else {
                    saveBtn.textContent = `Save (${total})`;
                }
            },

            removeBulkItem(index) {
                this.bulkTxs.splice(index, 1);
                this.renderBulkList();
                this.updateSaveButtonText();
            },

            openTxModal(tx = null) {
                this.bulkTxs = []; // Reset bulk list on open
                document.getElementById('bulk-list-container').classList.add('hidden');
                document.getElementById('save-btn').textContent = Lang.t('save');

                this.openModal('tx-modal');
                const form = document.getElementById('tx-form');
                form.reset();
                
                if (tx) { // If we are editing
                    document.getElementById('add-multi-btn').classList.add('hidden');
                    document.querySelector('#tx-modal h3').textContent = 'Edit Entry';
                    document.getElementById('tx-id').value = tx.id;
                    document.getElementById('tx-amount').value = tx.amount;
                    document.getElementById('tx-date').value = tx.date;
                    document.getElementById('tx-note').value = tx.note || '';
                    this.setTxType(tx.type);
                    
                    setTimeout(() => {
                        this.selectAccountChip('tx-account-chips', 'tx-account', tx.account, 'updateModalAccountBalance');
                        if (tx.type === 'transfer' && tx.toAccount) {
                            setTimeout(() => {
                                this.selectAccountChip('tx-to-account-chips', 'tx-to-account', tx.toAccount);
                            }, 50);
                        }
                    }, 50);

                    if (tx.type !== 'transfer') {
                        document.querySelectorAll('#category-chips .chip').forEach(chip => {
                            if (chip.textContent.includes(tx.category)) {
                                this.selCat(chip, tx.category);
                            }
                        });
                    }
                } else { // If we are adding new
                    document.getElementById('add-multi-btn').classList.remove('hidden');
                    document.querySelector('#tx-modal h3').textContent = Lang.t('addTx');
                    document.getElementById('tx-id').value = '';
                    document.getElementById('tx-date').valueAsDate = new Date();
                    this.setTxType('expense');
                }
            },
            setTxType(type) {
                this.currentTxType = type;
                ['tab-exp', 'tab-inc', 'tab-trf'].forEach(t => document.getElementById(t).classList.remove('active'));
                
                if (type === 'expense') document.getElementById('tab-exp').classList.add('active');
                if (type === 'income') document.getElementById('tab-inc').classList.add('active');
                if (type === 'transfer') document.getElementById('tab-trf').classList.add('active');
                
                document.getElementById('tx-account-label').textContent = type === 'transfer' ? 'From Account' : 'Account';
                
                // Hide or show appropriate sections
                if (type === 'transfer') {
                    document.getElementById('tx-category-container').classList.add('hidden');
                    // The "To" account container will be shown when a "From" account is selected, or we show it now
                    const toCont = document.getElementById('tx-to-account-container');
                    if (document.getElementById('tx-account').value) {
                        toCont.classList.remove('hidden');
                    } else {
                        toCont.classList.add('hidden');
                    }
                    document.getElementById('tx-category').value = 'Transfer';
                } else {
                    document.getElementById('tx-category-container').classList.remove('hidden');
                    document.getElementById('tx-to-account-container').classList.add('hidden');
                }

                // Render account chips unconditionally for "From" account to ensure latest balances and options
                this.renderAccountSelector('tx-account-chips', 'tx-account', null, 'updateModalAccountBalance');
                
                if (type !== 'transfer') {
                    const catList = type === 'income' ? State.categories.income : State.categories.expense;
                    const chipCont = document.getElementById('category-chips');
                    let html = catList.map(c => `<div class="chip" onclick="UI.selCat(this, '${c.name}')">${c.name}</div>`).join('');
                    html += `<div class="chip" onclick="UI.openQuickAddModal('category')" style="border-style:dashed; color:var(--primary);"><i class="fas fa-plus" style="font-size:0.8rem; opacity:0.7;"></i> New</div>`;
                    chipCont.innerHTML = html;
                    
                    if(catList.length > 0) {
                        this.selCat(chipCont.firstChild, catList[0].name);
                    }
                }

                this.updateModalAccountBalance();
            },
            
       // FIX: RESTORED FUNCTION
            selCat(el, val) {
                document.querySelectorAll('#category-chips .chip').forEach(c => c.classList.remove('active'));
                el.classList.add('active');
                document.getElementById('tx-category').value = val;
            },

            openQuickAddModal(type) {
                document.getElementById('quick-add-type').value = type;
                document.getElementById('quick-add-title').textContent = type === 'account' ? 'New Account' : 'New Category';
                document.getElementById('quick-add-name').value = '';
                this.openModal('quick-add-modal');
                setTimeout(() => document.getElementById('quick-add-name').focus(), 100);
            },
            
            closeQuickAddModal() {
                document.getElementById('quick-add-modal').classList.remove('active');
            },
            
            async saveQuickAdd(e) {
                e.preventDefault();
                const type = document.getElementById('quick-add-type').value;
                const name = document.getElementById('quick-add-name').value.trim();
                if (!name) return;
                
                const btn = document.getElementById('btn-quick-save');
                btn.disabled = true;
                btn.textContent = 'Saving...';
                
                try {
                    const docData = type === 'account' ? { name } : { name, type: this.currentTxType };
                    const coll = type === 'account' ? 'accounts' : 'categories';
                    await Data.addMeta(coll, docData);
                    this.showNotification(name + " added!", "success");
                    this.closeQuickAddModal();
                    
                    // State will update via real-time listener shortly, but we can do a quick local refresh 
                    // loop for immediate UX gratification. The main renderPage listener handles most of this.
                    setTimeout(() => {
                        if (type === 'category') {
                            this.setTxType(this.currentTxType);
                            // Auto select the new category
                            const cChips = document.querySelectorAll('#category-chips .chip');
                            const newChip = Array.from(cChips).find(c => c.textContent.includes(name));
                            if(newChip) this.selCat(newChip, name);
                        } else {
                            // Render all account selectors again so the new account shows up
                            this.renderAccountSelector('tx-account-chips', 'tx-account', null, 'updateModalAccountBalance');
                            this.renderAccountSelector('loan-account-chips', 'loan-account', null, 'updateLoanModalAccountBalance');
                            this.renderAccountSelector('settle-account-chips', 'settle-account', null, 'updateSettleModalAccountBalance');
                            if (document.getElementById('tx-to-account-container').style.display === 'block') {
                                this.renderAccountSelector('tx-to-account-chips', 'tx-to-account', document.getElementById('tx-account').value, 'updateModalAccountBalance');
                            }
                            
                            // Auto select the new account in the main form if it's open
                            if (document.getElementById('tx-modal').classList.contains('active')) {
                                this.selectAccountChip('tx-account-chips', 'tx-account', name, 'updateModalAccountBalance');
                            }
                        }
                    }, 500); // 500ms allows the firestore onSnapshot to sync the new doc into State first

                } catch(err) {
                    this.showNotification("Error: " + err.message);
                } finally {
                    btn.disabled = false;
                    btn.textContent = 'Save';
                }
            },
            
            openManageModal(type) {
                this.manageType = type;
                document.getElementById('manage-title').textContent = type==='account' ? Lang.t('add_acc') : Lang.t('add_cat');
                const typeGroup = document.getElementById('manage-type-group');
                if (type === 'category') {
                    typeGroup.classList.remove('hidden');
                } else {
                    typeGroup.classList.add('hidden');
                }
                document.getElementById('manage-name').value = '';
                document.getElementById('manage-edit-id').value = '';

                if(type==='category') this.setManageCatType('expense');
                else this.renderManagementList();

                this.openModal('manage-modal');
            },
            
            setManageCatType(type) {
                this.manageCatType = type;
                document.getElementById('m-tab-exp').className = type==='expense'?'segment-tab active':'segment-tab';
                document.getElementById('m-tab-inc').className = type==='income'?'segment-tab active':'segment-tab';
                this.renderManagementList();
            },

            renderManagementList() {
                const listEl = document.getElementById('manage-item-list');
                let items = [];
                if (this.manageType === 'account') {
                    items = State.accounts;
                } else {
                    items = State.categories[this.manageCatType];
                }

                if (items.length === 0) {
                    listEl.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding: 1.5rem; font-size:0.9rem;">No items found.</div>`;
                    return;
                }

                listEl.innerHTML = items.map(item => `
                    <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-input); padding:12px 16px; border-radius:var(--r-sm); margin-bottom:6px;">
                        <span style="font-weight:600; font-size:0.92rem;">${item.name}</span>
                        <div style="display:flex;gap:6px;">
                            <i class="fas fa-pen" style="cursor:pointer; color:var(--text-muted); padding:6px; border-radius:6px; transition:all 0.15s;" onmouseover="this.style.background='var(--bg-hover)'" onmouseout="this.style.background=''" onclick="UI.editManagementItem('${item.id}', '${item.name}')"></i>
                            <i class="fas fa-trash" style="cursor:pointer; color:var(--red); opacity:0.6; padding:6px; border-radius:6px; transition:all 0.15s;" onmouseover="this.style.background='var(--red-bg)'" onmouseout="this.style.background=''" onclick="UI.deleteManagementItem('${item.id}')"></i>
                        </div>
                    </div>
                `).join('');
            },

            editManagementItem(id, name) {
                document.getElementById('manage-name').value = name;
                document.getElementById('manage-edit-id').value = id;
                document.getElementById('manage-name').focus();
            },

            async deleteManagementItem(id) {
                if (!confirm('Are you sure you want to delete this item?')) return;
                const collectionName = this.manageType === 'account' ? 'accounts' : 'categories';
                await Data.deleteMeta(collectionName, id);
                // No need to manually render list, onSnapshot will do it.
            },

            async saveManagementItem() {
                const name = document.getElementById('manage-name').value.trim();
                const id = document.getElementById('manage-edit-id').value;
                if(!name) return;

                const collectionName = this.manageType === 'account' ? 'accounts' : 'categories';
                
                if (id) {
                    await Data.updateMeta(collectionName, id, { name });
                } else {
                    const data = this.manageType === 'account' 
                        ? { name } 
                        : { name, type: this.manageCatType };
                    await Data.addMeta(collectionName, data);
                }

                document.getElementById('manage-name').value = '';
                document.getElementById('manage-edit-id').value = '';
            },

            closeModals(fromPopstate = false) { 
                document.querySelectorAll('.modal-overlay').forEach(el => el.classList.remove('active')); 
                // Close quick add modal specifically if it's separate
                if (document.getElementById('quick-add-modal')) document.getElementById('quick-add-modal').classList.remove('active');

                // If closed manually (X button or outside click), go back in history to drop the modal state
                if (!fromPopstate && history.state && history.state.isModal) {
                    history.back();
                }
            }
        };

        // Start
        Auth.init();

          // NEW: Register the Service Worker for PWA functionality
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    })
                    .catch(err => {
                        console.log('ServiceWorker registration failed: ', err);
                    });
            });
        }