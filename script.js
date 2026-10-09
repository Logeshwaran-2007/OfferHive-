const products = [
  {
    name: "Biryani",
    price: 100,
    desc: "Spicy Chicken Biryani served hot with raita and masala.",
    shop: "Madurai Mess",
    loc: "Madurai, Tamil Nadu",
    img:"briyani.png"
  },
  {
    name: "T-Shirt (2 Pack)",
    price: 99,
    desc: "Combo of 2 stylish cotton T-shirts for daily wear.",
    shop: "StyleHub",
    loc: "Chennai, Tamil Nadu"
  },
  {
    name: "Formal Shirt",
    price: 150,
    desc: "Plain formal shirt for office and meetings.",
    shop: "Elite Garments",
    loc: "Trichy, Tamil Nadu"
  },
  {
    name: "Shirt & Pant Combo",
    price: 700,
    desc: "Matching cotton shirt and pant combo set for formal wear.",
    shop: "Royal Threads",
    loc: "Erode, Tamil Nadu"
  },
  {
    name: "Coffee",
    price: 80,
    desc: "Freshly brewed filter coffee with rich aroma.",
    shop: "Cafe restaurant",
    loc: "Coimbatore, Tamil Nadu"
  }
];
let cart = [];
function getUsers(){ return JSON.parse(localStorage.getItem('users')||'{}'); }
function setUsers(u){ localStorage.setItem('users', JSON.stringify(u)); }
function getSession(){ return JSON.parse(localStorage.getItem('session')||'null'); }
function setSession(s){ localStorage.setItem('session', JSON.stringify(s)); }
function clearSession(){ localStorage.removeItem('session'); }

function goto(id){
  document.querySelectorAll('main.screen').forEach(m=>m.classList.remove('active'));
  const el = document.getElementById(id);
  if(!el) return;
  el.classList.add('active');
  window.scrollTo(0,0);
  refreshProfileBlocks();
}

function registerSeller(){
  const uname = document.getElementById('s_username').value.trim();
  const phone = document.getElementById('s_phone').value.trim();
  const email = document.getElementById('s_email').value.trim().toLowerCase();
  const gst = document.getElementById('s_gst').value.trim();
  const shop = document.getElementById('s_shop').value.trim() || 'My Shop';
  const pass = document.getElementById('s_password').value;
  if(!uname || !phone || !email || !pass){ alert('Please fill required fields'); return; }
  const users = getUsers();
  if(users[email]) { alert('User exists — please login'); goto('login'); return; }
  users[email] = { role:'seller', username:uname, phone, email, password:pass, shop, gst };
  setUsers(users);
  alert('Seller registered — please login.');
  document.getElementById('sellerForm').reset();
  goto('login');
}

function registerCustomer(){
  const uname = document.getElementById('c_username').value.trim();
  const phone = document.getElementById('c_phone').value.trim();
  const email = document.getElementById('c_email').value.trim().toLowerCase();
  const pass = document.getElementById('c_password').value;
  if(!uname || !phone || !email || !pass){ alert('Please fill required fields'); return; }
  const users = getUsers();
  if(users[email]) { alert('User exists — please login'); goto('login'); return; }
  users[email] = { role:'customer', username:uname, phone, email, password:pass, name:uname };
  setUsers(users);
  alert('Customer registered — please login.');
  document.getElementById('custForm').reset();
  goto('login');
}

function doLogin(){
  const id = document.getElementById('loginUser').value.trim().toLowerCase();
  const pass = document.getElementById('loginPass').value;
  const users = getUsers();
  let found = null;
  for(const k in users){
    const u = users[k];
    if(u.email===id || u.username===id || k===id || (u.username && u.username.toLowerCase()===id)){
      if(u.password===pass){ found = u; break; }
    }
  }
  if(!found){ alert('Invalid credentials'); return; }
  setSession({ key: found.email || found.username, role: found.role });
  if(found.role === 'seller'){ goto('sellerDash'); showSeller('stats'); drawSellerCharts(); }
  else { goto('customerDash'); showCust('dash'); renderProducts(products); }
  refreshProfileBlocks();
}

function logout(){
  clearSession();
  refreshProfileBlocks();
  goto('login');
}

function refreshProfileBlocks(){
  const s = getSession();
  if(!s) return;
  const users = getUsers();
  let userObj = users[s.key] || Object.values(users).find(u => (u.email===s.key || u.username===s.key));
  if(!userObj) return;
  if(userObj.role === 'seller'){
    document.getElementById('sellerAvatar').textContent = (userObj.username||userObj.name||'S')[0].toUpperCase();
    document.getElementById('sellerName').textContent = userObj.username || userObj.name || 'Seller';
    document.getElementById('sellerShop').textContent = userObj.shop || '';
    updateOffersCount();
  } else {
    document.getElementById('custAvatar').textContent = (userObj.username||userObj.name||'C')[0].toUpperCase();
    document.getElementById('custName').textContent = userObj.username || userObj.name || 'Customer';
    document.getElementById('custPhone').textContent = userObj.phone || '';
  }
}


// Update offer count in seller dashboard
function updateOffersCount(){
  const s = getSession();
  if(!s) return;
  const users = getUsers();
  const userObj = users[s.key] || Object.values(users).find(u => (u.email===s.key || u.username===s.key));
  if(!userObj || userObj.role !== 'seller') return;
  let offers = JSON.parse(localStorage.getItem('offers') || '[]');
  offers = offers.filter(o => o.seller === userObj.username);
  document.getElementById('offers_count').textContent = offers.length;
}


// Seller Profile Modal
function showSellerProfile() {
  const s = getSession(); if(!s) return;
  const users = getUsers();
  const u = users[s.key] || Object.values(users).find(x => x.email === s.key || x.username === s.key);
  if(!u) return;
  document.getElementById('sp_username').value = u.username || '';
  document.getElementById('sp_email').value = u.email || '';
  document.getElementById('sp_phone').value = u.phone || '';
  document.getElementById('sp_shop').value = u.shop || '';
  document.getElementById('sp_gst').value = u.gst || '';
  document.getElementById('seller_profile_modal').classList.remove('hidden');
}
function closeSellerProfileModal() {
  document.getElementById('seller_profile_modal').classList.add('hidden');
}
function saveSellerProfile() {
  const s = getSession(); if(!s) return;
  const users = getUsers();
  let u = users[s.key] || Object.values(users).find(x => x.email === s.key || x.username === s.key);
  if(!u) return;
  const oldKey = s.key;
  const newEmail = document.getElementById('sp_email').value.trim().toLowerCase();
  u.username = document.getElementById('sp_username').value.trim();
  u.email = newEmail;
  u.phone = document.getElementById('sp_phone').value.trim();
  u.shop = document.getElementById('sp_shop').value.trim();
  u.gst = document.getElementById('sp_gst').value.trim();
  if(newEmail !== oldKey){
    delete users[oldKey];
    users[newEmail] = u;
    setSession({ key: newEmail, role: u.role });
  } else {
    users[oldKey] = u;
  }
  setUsers(users);
  alert('Seller profile updated');
  closeSellerProfileModal();
  refreshProfileBlocks();
}


// Customer Profile Modal
function showCustomerProfile() {
  const s = getSession(); if(!s) return;
  const users = getUsers();
  const u = users[s.key] || Object.values(users).find(x => x.email === s.key || x.username === s.key);
  if(!u) return;
  document.getElementById('p_name').value = u.username || u.name || '';
  document.getElementById('p_email').value = u.email || '';
  document.getElementById('p_phone').value = u.phone || '';
  document.getElementById('customer_profile_modal').classList.remove('hidden');
}
function closeCustomerProfileModal() {
  document.getElementById('customer_profile_modal').classList.add('hidden');
}
function saveProfile(){
  const s = getSession();
  if(!s){ alert('Not logged in'); return; }
  const users = getUsers();
  let u = users[s.key] || Object.values(users).find(x => x.username === s.key || x.email === s.key);
  if(!u) return;
  const oldKey = s.key;
  const newEmail = document.getElementById('p_email').value.trim().toLowerCase();
  const newUsername = document.getElementById('p_name').value.trim();
  u.username = newUsername; // allow username change
  u.email = newEmail;
  u.phone = document.getElementById('p_phone').value.trim();
  if(newEmail !== oldKey){
    delete users[oldKey];
    users[newEmail] = u;
    setSession({ key: newEmail, role: u.role });
  } else {
    users[oldKey] = u;
  }
  setUsers(users);
  alert('Profile updated');
  closeCustomerProfileModal();
  refreshProfileBlocks();
}


// Add Offer Modal Controls
function openAddOfferModal() {
  document.getElementById('add_offer_modal').classList.remove('hidden');
}
function closeAddOfferModal() {
  document.getElementById('add_offer_modal').classList.add('hidden');
}
function saveNewOffer() {
  const title = document.getElementById('offer_title').value.trim();
  const desc = document.getElementById('offer_desc').value.trim();
  const price = parseFloat(document.getElementById('offer_price').value.trim());
  const category = document.getElementById('offer_category').value;

  if (!title || !desc || isNaN(price) || !category) {
    alert('Please fill all required fields correctly.');
    return;
  }

  const s = getSession();
  if (!s) {
    alert('User not logged in');
    return;
  }
  const users = getUsers();
  const userObj = users[s.key] || Object.values(users).find(u => (u.email === s.key || u.username === s.key));
  if (!userObj || userObj.role !== 'seller') {
    alert('Only sellers can add offers');
    return;
  }

  const fileInput = document.getElementById('offer_image');
  const file = fileInput.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const base64Image = e.target.result;
      saveOfferData(title, desc, price, category, base64Image, userObj.username);
    };
    reader.readAsDataURL(file);
  } else {
    saveOfferData(title, desc, price, category, null, userObj.username);
  }
}

function saveOfferData(title, desc, price, category, imageBase64, sellerUsername) {
  let offers = JSON.parse(localStorage.getItem('offers') || '[]');
  offers.push({
    title,
    desc,
    price,
    category,
    image: imageBase64,
    created: new Date().toISOString(),
    seller: sellerUsername
  });
  localStorage.setItem('offers', JSON.stringify(offers));
  alert('Offer added successfully.');
  document.getElementById('addOfferForm').reset();
  closeAddOfferModal();
  updateOffersCount();
}


// Show Seller Offers List Modal
document.getElementById('offers_stat').addEventListener('click', () => {
  showOffersListModal();
});

function showOffersListModal(){
  const s = getSession();
  if(!s) return;
  const users = getUsers();
  const userObj = users[s.key] || Object.values(users).find(u => (u.email===s.key || u.username===s.key));
  if(!userObj || userObj.role !== 'seller') {
    alert('Only sellers can view offers');
    return;
  }
  let offers = JSON.parse(localStorage.getItem('offers') || '[]');
  offers = offers.filter(o => o.seller === userObj.username);

  const container = document.getElementById('offers_list_content');
  if(offers.length === 0){
    container.innerHTML = '<p>No offers posted yet.</p>';
  } else {
    container.innerHTML = '';
    offers.forEach(o => {
      const div = document.createElement('div');
      div.className = 'offer-item';
      div.innerHTML = `
        ${o.image ? `<img src="${o.image}" alt="${o.title}">` : ''}
        <div class="offer-title">${o.title}</div>
        <div class="offer-desc">${o.desc}</div>
        <div class="offer-meta">Price: ₹${o.price} | Category: ${capitalize(o.category)} | Added: ${new Date(o.created).toLocaleDateString()}</div>
      `;
      container.appendChild(div);
    });
  }
  document.getElementById('offers_list_modal').classList.remove('hidden');
}
function closeOffersListModal(){
  document.getElementById('offers_list_modal').classList.add('hidden');
}

function capitalize(str) {
  if(!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Seller area helpers
function showSeller(view){
  ['seller_stats','seller_report'].forEach(id => document.getElementById(id).classList.add('hidden'));
  const el = document.getElementById('seller_'+view);
  if(el) el.classList.remove('hidden');
  if(view === 'report') drawSellerCharts();
}

// Draw Seller Charts
function drawSellerCharts(){
  const ctx = document.getElementById('s_bar');
  const ctx2 = document.getElementById('s_pie');
  if(window.sBar) window.sBar.destroy();
  if(window.sPie) window.sPie.destroy();
  window.sBar = new Chart(ctx, {
    type:'bar',
    data:{
      labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      datasets:[{label:'Sales ₹', data:[1200,900,1400,1100,1600,900,1300], backgroundColor:'#c07b00', borderRadius:6 }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:true,
      plugins:{ legend:{display:false} },
      scales:{
        x: { grid:{display:false}, ticks:{font:{size:12}} },
        y: { grid:{display:false}, ticks:{font:{size:12}, beginAtZero:true} }
      }
    }
  });
  window.sPie = new Chart(ctx2, {
    type:'pie',
    data:{
      labels:['Food Offers', 'Clothing Offers', 'General Offers'],
      datasets:[{
        data:[50,30,20],
        backgroundColor:['#fbc02d','#1976d2','#388e3c'],
        borderWidth:1
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:true,
      plugins:{ legend:{position:'bottom', labels:{font:{size:13}} } }
    }
  });
}

// Customer Area: Products/Search/Cart/Payment
function renderProducts(list){
  const container = document.getElementById('productList');
  if(!container) return;
  container.innerHTML = '';
  list.forEach(p => {
    const div = document.createElement('div');
    div.className = 'product-card';
    div.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <div style="padding:.25rem 0">
        <h4 style="margin:.2rem 0">${p.name}</h4>
        <div class="small-muted">₹${p.price} • ${p.shop}</div>
      </div>
      <div style="margin-top:auto;display:flex;justify-content:flex-end">
        <button class="btn" onclick="showProductModal('${p.name.replace(/'/g, "\\'")}')">Quick View</button>
      </div>`;
    container.appendChild(div);
  });
  const search = document.getElementById('productSearch');
  if(search){
    search.oninput = function(){
      const q = this.value.trim().toLowerCase();
      const filtered = products.filter(p => p.name.toLowerCase().includes(q));
      renderProducts(filtered);
    };
  }
}
function showProductModal(name){
  const p = products.find(x => x.name === name);
  if(!p) return;
  document.getElementById('modalContent').innerHTML = `
    <img src="${p.img}" style="width:100%;height:140px;object-fit:cover;border-radius:8px;margin-bottom:8px">
    <h2 style="margin:0 0 7px 0">${p.name}</h2>
    <p style="font-weight:700;margin:0 0 2px 0">₹${p.price}</p>
    <p class="small-muted" style="margin:0 0 4px 0">${p.desc}</p>
    <p class="small-muted" style="font-size:0.97rem;margin-bottom:8px"><b>Shop:</b> ${p.shop} • ${p.loc}</p>
    <div style="margin-top:8px;text-align:end">
      <button class="btn" onclick="addToCart('${p.name.replace(/'/g, "\\'")}',${p.price},'${p.img}');closeProductModal()">Add to Cart</button>
    </div>`;
  document.getElementById('productModal').style.display = 'block';
}
function closeProductModal(){
  document.getElementById('productModal').style.display = 'none';
}
function addToCart(name, price, img){
  cart.push({ name, price, img });
  alert(`${name} added to cart`);
}
function renderCart(){
  const el = document.getElementById('cartItems');
  el.innerHTML = '';
  if(cart.length === 0){
    el.innerHTML = '<div class="card small-muted">Cart is empty</div>';
    document.getElementById('cartTotal').textContent = '';
    return;
  }
  cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `<img src="${item.img}" style="width:70px;height:70px;border-radius:8px;object-fit:cover"><div><b>${item.name}</b><div class="small-muted">₹${item.price}</div></div>`;
    el.appendChild(row);
  });
  document.getElementById('cartTotal').textContent = "Total: ₹" + cart.reduce((a,b) => a + b.price, 0);
}
function togglePayment(){
  const v = document.getElementById('payMethod').value;
  ['upiBox','cardBox','codBox'].forEach(id => document.getElementById(id).classList.add('hidden'));
  document.getElementById(v+'Box').classList.remove('hidden');
}
function confirmPay(){
  const method = document.getElementById('payMethod').value;
  if(method === 'upi' && !document.getElementById('upiId').value){ alert('Enter UPI ID'); return; }
  if(method === 'card' && !document.getElementById('cardNum').value){ alert('Enter card number'); return; }
  if(method === 'cod' && !document.getElementById('addr').value){ alert('Enter delivery address'); return; }
  cart = [];
  showCust('confirm');
}
function backToDashboardFromConfirm(){
  showCust('dash');
  goto('customerDash');
}

function showSellerView(view){
  showSeller(view);
  goto('sellerDash');
}
function showCustomerView(view){
  showCust(view);
  goto('customerDash');
}
function showCust(v){
  ['c_dash','c_details','c_cart','c_payment','c_confirm'].forEach(i => {
    const el = document.getElementById(i);
    if(el) el.classList.add('hidden');
  });
  if(v !== 'profile'){
    const el = document.getElementById('c_'+v);
    if(el) el.classList.remove('hidden');
  }
  if(v === 'cart') renderCart();
  if(v === 'payment') {
    document.getElementById('totalPay').textContent = "Total: ₹" + (cart.reduce((a,b) => a+b.price, 0) || 0);
    togglePayment();
  }
}

// Initial UI Setup
(function init(){
  goto('login');
  renderProducts(products);
  const s = getSession();
  if(s){
    const users = getUsers();
    const u = users[s.key] || Object.values(users).find(x => x.username === s.key || x.email === s.key);
    if(u){
      if(u.role === 'seller'){ goto('sellerDash'); showSeller('stats'); drawSellerCharts(); }
      else { goto('customerDash'); showCust('dash'); renderProducts(products); }
      refreshProfileBlocks();
    }
  }
})();

