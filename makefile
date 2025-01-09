make: build
	
build: run
	
run:
	open ./index.html

deploy:
	rsync -vrc * tyg@theyardgames.org:/httpdocs/game/waves --exclude-from rsync-exclude

deploy-test:
	rsync -vrc * tyg@theyardgames.org:/httpdocs/game/waves/test --exclude-from rsync-exclude