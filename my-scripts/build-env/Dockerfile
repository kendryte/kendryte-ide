FROM fedora:latest

RUN dnf --verbose makecache \
 && dnf install -y \
		wget xz libstdc++ python2 \
		make gcc-c++ libsecret-devel libX11-devel libxkbfile-devel \
		gtk2 libXtst libXScrnSaver GConf2 alsa-lib \
		fakeroot dpkg rpm-build \
 && dnf clean all

RUN dnf --verbose makecache \
 && sh -c 'dnf --installroot=/32bit \
				--forcearch=i686 \
				--setopt=cachedir=../../var/cache/dnf \
				--setopt=config_file_path=/etc/dnf/dnf.conf \
				--setopt=reposdir=/etc/yum.repos.d \
				--releasever=/ install -y $(for i in "$@"; do echo $i.i686 ; done)' \
		-- wget xz libstdc++ python2 \
		make gcc-c++ libsecret-devel libX11-devel libxkbfile-devel \
		gtk2 libXtst libXScrnSaver GConf2 alsa-lib \
		fakeroot dpkg rpm-build \
 && dnf clean all

RUN wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh -O /tmp/nvm.sh \
 && bash /tmp/nvm.sh && chroot /32bit /bin/bash /tmp/nvm.sh

