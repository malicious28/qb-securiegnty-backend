# 📧 Domain Verification Setup for QB Securiegnty Email System

## 🎯 **Objective**
Set up `admin@qbsecuriegnty.com` as the sender email address for all system emails including:
- 🔐 User registration/login emails
- 📅 Appointment confirmations  
- 🚀 Early access notifications
- 🔑 Password reset emails

## 📋 **Step-by-Step Domain Verification in Resend**

### **1. Access Resend Dashboard**
- Go to [Resend Dashboard](https://resend.com/domains)
- Log in with your account (ashikamishra63@gmail.com)

### **2. Add Your Domain**
- Click "Add Domain" button
- Enter: `qbsecuriegnty.com`
- Click "Add Domain"

### **3. DNS Configuration Required**
You'll need to add these DNS records to your domain provider:

#### **SPF Record (TXT)**
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all
```

#### **DKIM Record (TXT)**
```
Type: TXT  
Name: resend._domainkey
Value: [Will be provided by Resend - unique for your domain]
```

#### **DMARC Record (TXT)** *(Optional but recommended)*
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:admin@qbsecuriegnty.com
```

### **4. Verification Process**
1. Add the DNS records to your domain provider
2. Wait 24-48 hours for DNS propagation
3. Resend will automatically verify the records
4. You'll receive confirmation when verification is complete

### **5. Email Address Setup**
Once domain is verified, you can send from:
- ✅ `admin@qbsecuriegnty.com`
- ✅ `noreply@qbsecuriegnty.com`  
- ✅ `support@qbsecuriegnty.com`
- ✅ Any address @qbsecuriegnty.com

## 🔄 **Alternative: Use Subdomain (Faster Setup)**

If you want faster setup, you can use a subdomain:
- Domain: `mail.qbsecuriegnty.com`
- Email: `admin@mail.qbsecuriegnty.com`

## 🚨 **Current Status**

**Before Domain Verification:**
- ❌ Using: `admin@qbsecuriegnty.com` (Will fail)
- ⚠️ May show "unverified sender" warnings

**After Domain Verification:**
- ✅ Using: `admin@qbsecuriegnty.com` (Will work perfectly)
- ✅ Professional email delivery
- ✅ Better deliverability rates

## 🛠️ **Temporary Solution**

While waiting for domain verification, you can:
1. Continue using `onboarding@resend.dev` (working now)
2. Or use any verified email address you have

## 📊 **Testing Commands**

Once domain is verified, test with:
```bash
node test-resend-email.js
node test-appointment-resend.js
```

## 🔗 **Useful Links**
- [Resend Domain Setup Guide](https://resend.com/docs/dashboard/domains)
- [DNS Record Checker](https://mxtoolbox.com/SuperTool.aspx)
- [Email Deliverability Best Practices](https://resend.com/docs/knowledge-base/deliverability)