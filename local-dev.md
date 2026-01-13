# Local Jekyll Development Setup (Ubuntu / Kubuntu 24.04)

This guide explains how to install **Ruby**, **Bundler**, and **Jekyll** for **local development only** on Ubuntu/Kubuntu 24.04 using **RVM**.

> ⚠️ Ubuntu 24.04 ships OpenSSL 3
> Ruby 3.0 **does not work** with OpenSSL 3
> We must use **RVM’s internal OpenSSL**

---

## 1. Install system dependencies

```bash
sudo apt update
sudo apt install -y curl gpg build-essential \
  libreadline-dev zlib1g-dev libyaml-dev libffi-dev \
  libgdbm-dev libncurses5-dev libtool bison autoconf
```

---

## 2. Install RVM (Ruby Version Manager)

```bash
curl -sSL https://get.rvm.io | bash -s stable
```

Import required GPG keys:

```bash
gpg2 --keyserver hkp://keyserver.ubuntu.com --recv-keys \
  409B6B1796C275462A1703113804BB82D39DC0E3 \
  7D2BAF1CF37B13E2069D6956105BD0E739499BDB
```

Reload your shell:

```bash
source ~/.rvm/scripts/rvm
```

Verify RVM:

```bash
rvm --version
```

---

## 3. Install OpenSSL via RVM (IMPORTANT)

Ubuntu 24.04 **does not provide OpenSSL 1.1**, which Ruby 3.0 requires.

Let RVM build its own:

```bash
rvm pkg install openssl
```

This installs OpenSSL under:

```
~/.rvm/usr
```

---

## 4. Install Ruby 3.0.6 (with RVM OpenSSL)

Remove any broken Ruby installs first:

```bash
rvm remove 3.0.6
```

Install Ruby using RVM’s OpenSSL:

```bash
rvm install 3.0.6 --with-openssl-dir=$HOME/.rvm/usr
```

Set it as default:

```bash
rvm use 3.0.6 --default
```

Verify:

```bash
ruby -v
ruby -ropenssl -e 'puts OpenSSL::OPENSSL_VERSION'
```

You should see **OpenSSL 1.1.x**.

---

## 5. Install Bundler

```bash
gem install bundler
```

Verify:

```bash
bundle -v
```

---

## 6. Install project dependencies (Jekyll site)

From your Jekyll project directory:

```bash
cd ~/git.projects/elanius.github.io
bundle install
```

---

## 7. Run Jekyll locally

Basic server:

```bash
bundle exec jekyll serve
```

With live reload (recommended):

```bash
bundle exec jekyll serve --livereload
```

Open in browser:

```
http://localhost:4000
```