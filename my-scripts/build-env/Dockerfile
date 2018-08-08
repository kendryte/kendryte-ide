FROM fedora:latest
WORKDIR /data

RUN dnf --verbose makecache \
 && dnf install -y bash wget curl tar xz python2 findutils git \
        make libstdc++ gcc-c++ libsecret-devel libX11-devel libxkbfile-devel \
        gtk2 libXtst libXScrnSaver GConf2 alsa-lib \
        wqy-zenhei-fonts wqy-unibit-fonts wqy-bitmap-fonts \
 && dnf clean all

COPY my-scripts /data/my-scripts/
RUN bash ./my-scripts/prepare-release.sh
COPY . /data/

