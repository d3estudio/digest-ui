.PHONY: all

VERSION := $(shell cat VERSION)

all:
		docker build --build-arg BUILD_DATE=`date -u +"%Y-%m-%dT%H:%M:%SZ"` \
	               --build-arg VCS_REF=`git rev-parse --short HEAD` \
	               --build-arg VERSION=`cat VERSION` \
								 -t "d3estudio/digest-ui:$(VERSION)" \
								 .
		docker push "d3estudio/digest-ui:$(VERSION)"
