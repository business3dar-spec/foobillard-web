
  var Module = typeof Module !== 'undefined' ? Module : {};

  if (!Module.expectedDataFileDownloads) {
    Module.expectedDataFileDownloads = 0;
  }

  Module.expectedDataFileDownloads++;
  (function() {
    // When running as a pthread, FS operations are proxied to the main thread, so we don't need to
    // fetch the .data bundle on the worker
    if (Module['ENVIRONMENT_IS_PTHREAD']) return;
    var loadPackage = function(metadata) {

      var PACKAGE_PATH = '';
      if (typeof window === 'object') {
        PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
      } else if (typeof process === 'undefined' && typeof location !== 'undefined') {
        // web worker
        PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf('/')) + '/');
      }
      var PACKAGE_NAME = '/home/claude/work/build_chunked/chunk4.data';
      var REMOTE_PACKAGE_BASE = 'chunk4.data';
      if (typeof Module['locateFilePackage'] === 'function' && !Module['locateFile']) {
        Module['locateFile'] = Module['locateFilePackage'];
        err('warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)');
      }
      var REMOTE_PACKAGE_NAME = Module['locateFile'] ? Module['locateFile'](REMOTE_PACKAGE_BASE, '') : REMOTE_PACKAGE_BASE;

      var REMOTE_PACKAGE_SIZE = metadata['remote_package_size'];
      var PACKAGE_UUID = metadata['package_uuid'];

      function fetchRemotePackage(packageName, packageSize, callback, errback) {
        if (typeof process === 'object' && typeof process.versions === 'object' && typeof process.versions.node === 'string') {
          require('fs').readFile(packageName, function(err, contents) {
            if (err) {
              errback(err);
            } else {
              callback(contents.buffer);
            }
          });
          return;
        }
        var xhr = new XMLHttpRequest();
        xhr.open('GET', packageName, true);
        xhr.responseType = 'arraybuffer';
        xhr.onprogress = function(event) {
          var url = packageName;
          var size = packageSize;
          if (event.total) size = event.total;
          if (event.loaded) {
            if (!xhr.addedTotal) {
              xhr.addedTotal = true;
              if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
              Module.dataFileDownloads[url] = {
                loaded: event.loaded,
                total: size
              };
            } else {
              Module.dataFileDownloads[url].loaded = event.loaded;
            }
            var total = 0;
            var loaded = 0;
            var num = 0;
            for (var download in Module.dataFileDownloads) {
            var data = Module.dataFileDownloads[download];
              total += data.total;
              loaded += data.loaded;
              num++;
            }
            total = Math.ceil(total * Module.expectedDataFileDownloads/num);
            if (Module['setStatus']) Module['setStatus']('Downloading data... (' + loaded + '/' + total + ')');
          } else if (!Module.dataFileDownloads) {
            if (Module['setStatus']) Module['setStatus']('Downloading data...');
          }
        };
        xhr.onerror = function(event) {
          throw new Error("NetworkError for: " + packageName);
        }
        xhr.onload = function(event) {
          if (xhr.status == 200 || xhr.status == 304 || xhr.status == 206 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            var packageData = xhr.response;
            callback(packageData);
          } else {
            throw new Error(xhr.statusText + " : " + xhr.responseURL);
          }
        };
        xhr.send(null);
      };

      function handleError(error) {
        console.error('package error:', error);
      };

      var fetchedCallback = null;
      var fetched = Module['getPreloadedPackage'] ? Module['getPreloadedPackage'](REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE) : null;

      if (!fetched) fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, function(data) {
        if (fetchedCallback) {
          fetchedCallback(data);
          fetchedCallback = null;
        } else {
          fetched = data;
        }
      }, handleError);

    function runWithFS() {

      function assert(check, msg) {
        if (!check) throw msg + new Error().stack;
      }
Module['FS_createPath']("/", "locale", true, true);
Module['FS_createPath']("/locale", "img", true, true);
Module['FS_createPath']("/", "html", true, true);
Module['FS_createPath']("/html", "images", true, true);
Module['FS_createPath']("/locale", "en-uk", true, true);
Module['FS_createPath']("/locale", "en-us", true, true);
Module['FS_createPath']("/locale", "ru", true, true);
Module['FS_createPath']("/locale", "de", true, true);
Module['FS_createPath']("/locale", "es", true, true);
Module['FS_createPath']("/", "music", true, true);
Module['FS_createPath']("/locale", "css", true, true);

      /** @constructor */
      function DataRequest(start, end, audio) {
        this.start = start;
        this.end = end;
        this.audio = audio;
      }
      DataRequest.prototype = {
        requests: {},
        open: function(mode, name) {
          this.name = name;
          this.requests[name] = this;
          Module['addRunDependency']('fp ' + this.name);
        },
        send: function() {},
        onload: function() {
          var byteArray = this.byteArray.subarray(this.start, this.end);
          this.finish(byteArray);
        },
        finish: function(byteArray) {
          var that = this;
          // canOwn this data in the filesystem, it is a slide into the heap that will never change
          Module['FS_createDataFile'](this.name, null, byteArray, true, true, true);
          Module['removeRunDependency']('fp ' + that.name);
          this.requests[this.name] = null;
        }
      };

      var files = metadata['files'];
      for (var i = 0; i < files.length; ++i) {
        new DataRequest(files[i]['start'], files[i]['end'], files[i]['audio'] || 0).open('GET', files[i]['filename']);
      }

      function processPackageData(arrayBuffer) {
        assert(arrayBuffer, 'Loading data file failed.');
        assert(arrayBuffer instanceof ArrayBuffer, 'bad input to processPackageData');
        var byteArray = new Uint8Array(arrayBuffer);
        var curr;
        // Reuse the bytearray from the XHR as the source for file reads.
          DataRequest.prototype.byteArray = byteArray;
          var files = metadata['files'];
          for (var i = 0; i < files.length; ++i) {
            DataRequest.prototype.requests[files[i].filename].onload();
          }          Module['removeRunDependency']('datafile_/home/claude/work/build_chunked/chunk4.data');

      };
      Module['addRunDependency']('datafile_/home/claude/work/build_chunked/chunk4.data');

      if (!Module.preloadResults) Module.preloadResults = {};

      Module.preloadResults[PACKAGE_NAME] = {fromCache: false};
      if (fetched) {
        processPackageData(fetched);
        fetched = null;
      } else {
        fetchedCallback = processPackageData;
      }

    }
    if (Module['calledRun']) {
      runWithFS();
    } else {
      if (!Module['preRun']) Module['preRun'] = [];
      Module["preRun"].push(runWithFS); // FS is not initialized yet, wait for it
    }

    }
    loadPackage({"files": [{"filename": "/locale/img/start.png", "start": 0, "end": 284373}, {"filename": "/queue.png", "start": 284373, "end": 561707}, {"filename": "/bomb.wav", "start": 561707, "end": 838439, "audio": 1}, {"filename": "/balloutoftable.wav", "start": 838439, "end": 1105851, "audio": 1}, {"filename": "/locale/img/8ball.png", "start": 1105851, "end": 1362946}, {"filename": "/cabinet-back.png", "start": 1362946, "end": 1604228}, {"filename": "/locale/img/menue-haupt.png", "start": 1604228, "end": 1844336}, {"filename": "/cabinet-front.png", "start": 1844336, "end": 2055697}, {"filename": "/smack.wav", "start": 2055697, "end": 2235565, "audio": 1}, {"filename": "/oneballontable.wav", "start": 2235565, "end": 2413141, "audio": 1}, {"filename": "/graffity2.png", "start": 2413141, "end": 2589529}, {"filename": "/queue3.png", "start": 2589529, "end": 2752145}, {"filename": "/html/images/feature.jpg", "start": 2752145, "end": 2911272}, {"filename": "/graffity1.png", "start": 2911272, "end": 3050444}, {"filename": "/board.png", "start": 3050444, "end": 3181042}, {"filename": "/queue2.png", "start": 3181042, "end": 3304261}, {"filename": "/negy.png", "start": 3304261, "end": 3411028}, {"filename": "/foobillardplus.ico", "start": 3411028, "end": 3513162}, {"filename": "/fire2.png", "start": 3513162, "end": 3614596}, {"filename": "/fire5.png", "start": 3614596, "end": 3714890}, {"filename": "/locale/en-uk/index_a.html", "start": 3714890, "end": 3814488}, {"filename": "/locale/en-us/index_a.html", "start": 3814488, "end": 3914084}, {"filename": "/locale/ru/index_a.html", "start": 3914084, "end": 4012892}, {"filename": "/fire3.png", "start": 4012892, "end": 4111503}, {"filename": "/fire6.png", "start": 4111503, "end": 4209541}, {"filename": "/locale/de/index_a.html", "start": 4209541, "end": 4307123}, {"filename": "/locale/en-us/index.html", "start": 4307123, "end": 4404641}, {"filename": "/fire4.png", "start": 4404641, "end": 4501468}, {"filename": "/locale/ru/index.html", "start": 4501468, "end": 4598255}, {"filename": "/locale/de/index.html", "start": 4598255, "end": 4691961}, {"filename": "/cloth-col.png", "start": 4691961, "end": 4783732}, {"filename": "/fire7.png", "start": 4783732, "end": 4874922}, {"filename": "/fire9.png", "start": 4874922, "end": 4964195}, {"filename": "/fire8.png", "start": 4964195, "end": 5053351}, {"filename": "/negx.png", "start": 5053351, "end": 5142260}, {"filename": "/fire11.png", "start": 5142260, "end": 5229557}, {"filename": "/shadow3.png", "start": 5229557, "end": 5316180}, {"filename": "/fire1.png", "start": 5316180, "end": 5402465}, {"filename": "/fire10.png", "start": 5402465, "end": 5488248}, {"filename": "/fire12.png", "start": 5488248, "end": 5573614}, {"filename": "/fire13.png", "start": 5573614, "end": 5656241}, {"filename": "/fire0.png", "start": 5656241, "end": 5738866}, {"filename": "/posx.png", "start": 5738866, "end": 5817319}, {"filename": "/table-frame.png", "start": 5817319, "end": 5886522}, {"filename": "/posy.png", "start": 5886522, "end": 5953962}, {"filename": "/bumpref.png", "start": 5953962, "end": 6014209}, {"filename": "/mright-wetab.png", "start": 6014209, "end": 6068693}, {"filename": "/art.png", "start": 6068693, "end": 6120033}, {"filename": "/mright.png", "start": 6120033, "end": 6165161}, {"filename": "/english.png", "start": 6165161, "end": 6206267}, {"filename": "/posz.png", "start": 6206267, "end": 6241820}, {"filename": "/locale/img/steuerkreuz.png", "start": 6241820, "end": 6276630}, {"filename": "/html/tournament.xsl", "start": 6276630, "end": 6311123}, {"filename": "/cabinet-frame.png", "start": 6311123, "end": 6344399}, {"filename": "/foobillardplus.png", "start": 6344399, "end": 6376437}, {"filename": "/sphere_map_128x128.png", "start": 6376437, "end": 6407534}, {"filename": "/sphere_ball.png", "start": 6407534, "end": 6433353}, {"filename": "/volume.png", "start": 6433353, "end": 6456888}, {"filename": "/locale/img/volume.png", "start": 6456888, "end": 6480423}, {"filename": "/locale/es/index_a.html", "start": 6480423, "end": 6500704}, {"filename": "/locale/ru/wetab-foobillard.txt", "start": 6500704, "end": 6520713}, {"filename": "/locale/ru/foobillard.txt", "start": 6520713, "end": 6540368}, {"filename": "/locale/es/index.html", "start": 6540368, "end": 6560004}, {"filename": "/locale/img/gpl.txt", "start": 6560004, "end": 6578325}, {"filename": "/mleft.png", "start": 6578325, "end": 6595708}, {"filename": "/ball_ball.raw", "start": 6595708, "end": 6612216}, {"filename": "/html/images/logo.jpg", "start": 6612216, "end": 6628136}, {"filename": "/mleftnormal.png", "start": 6628136, "end": 6644055}, {"filename": "/locale/es/wetab-foobillard.txt", "start": 6644055, "end": 6659226}, {"filename": "/locale/es/foobillard.txt", "start": 6659226, "end": 6674188}, {"filename": "/locale/de/foobillard.txt", "start": 6674188, "end": 6688112}, {"filename": "/locale/de/wetab-foobillard.txt", "start": 6688112, "end": 6701965}, {"filename": "/tabletex_wetab_256x256.png", "start": 6701965, "end": 6715337}, {"filename": "/locale/en-us/wetab-foobillard.txt", "start": 6715337, "end": 6727668}, {"filename": "/locale/en-us/foobillard.txt", "start": 6727668, "end": 6739853}, {"filename": "/locale/en-uk/foobillard.txt", "start": 6739853, "end": 6752033}, {"filename": "/f.png", "start": 6752033, "end": 6762571}, {"filename": "/locale/img/shot.png", "start": 6762571, "end": 6773096}, {"filename": "/kreuz.png", "start": 6773096, "end": 6783419}, {"filename": "/shot.png", "start": 6783419, "end": 6793616}, {"filename": "/s.png", "start": 6793616, "end": 6803808}, {"filename": "/m.png", "start": 6803808, "end": 6813924}, {"filename": "/e.png", "start": 6813924, "end": 6823947}, {"filename": "/stone-frame.png", "start": 6823947, "end": 6833834}, {"filename": "/b1.png", "start": 6833834, "end": 6843306}, {"filename": "/fov.png", "start": 6843306, "end": 6852439}, {"filename": "/disc.png", "start": 6852439, "end": 6861527}, {"filename": "/firemesh.png", "start": 6861527, "end": 6870164}, {"filename": "/html/history.xsl", "start": 6870164, "end": 6878117}, {"filename": "/locale/img/voll.png", "start": 6878117, "end": 6885349}, {"filename": "/html/styles.css", "start": 6885349, "end": 6892285}, {"filename": "/locale/img/n.png", "start": 6892285, "end": 6899112}, {"filename": "/locale/img/b1.png", "start": 6899112, "end": 6905877}, {"filename": "/locale/img/weiss.png", "start": 6905877, "end": 6912533}, {"filename": "/sofa.png", "start": 6912533, "end": 6919182}, {"filename": "/fp.png", "start": 6919182, "end": 6925831}, {"filename": "/lightflare.png", "start": 6925831, "end": 6932269}, {"filename": "/locale/img/network.png", "start": 6932269, "end": 6938699}, {"filename": "/full_symbol.png", "start": 6938699, "end": 6944973}, {"filename": "/fullhalf_symbol.png", "start": 6944973, "end": 6951082}, {"filename": "/n.png", "start": 6951082, "end": 6957172}, {"filename": "/b.png", "start": 6957172, "end": 6963180}, {"filename": "/locale/img/halb.png", "start": 6963180, "end": 6968925}, {"filename": "/locale/img/down.png", "start": 6968925, "end": 6974235}, {"filename": "/locale/img/up.png", "start": 6974235, "end": 6979498}, {"filename": "/tabletex_wetab_128x128.png", "start": 6979498, "end": 6984177}, {"filename": "/icon.bmp", "start": 6984177, "end": 6988327}, {"filename": "/foobillardplus.xbm", "start": 6988327, "end": 6992041}, {"filename": "/locale/img/m1.png", "start": 6992041, "end": 6995695}, {"filename": "/locale/img/s1.png", "start": 6995695, "end": 6999314}, {"filename": "/locale/img/symbol-f.png", "start": 6999314, "end": 7002756}, {"filename": "/tabletex_fB_256x256.png", "start": 7002756, "end": 7006059}, {"filename": "/cloth.png", "start": 7006059, "end": 7009355}, {"filename": "/half_symbol.png", "start": 7009355, "end": 7012601}, {"filename": "/up.png", "start": 7012601, "end": 7015830}, {"filename": "/down.png", "start": 7015830, "end": 7018990}, {"filename": "/html/images/gradient-shadow.png", "start": 7018990, "end": 7021984}, {"filename": "/locale/img/esc.png", "start": 7021984, "end": 7024973}, {"filename": "/locale/img/fov.png", "start": 7024973, "end": 7027762}, {"filename": "/locale/img/e1.png", "start": 7027762, "end": 7030459}, {"filename": "/html/images/header-bg.jpg", "start": 7030459, "end": 7033117}, {"filename": "/screenshot.png", "start": 7033117, "end": 7035298}, {"filename": "/locale/img/screenshot.png", "start": 7035298, "end": 7037479}, {"filename": "/locale/img/document-save.png", "start": 7037479, "end": 7039601}, {"filename": "/start.png", "start": 7039601, "end": 7041715}, {"filename": "/pause.png", "start": 7041715, "end": 7043770}, {"filename": "/shadow2.png", "start": 7043770, "end": 7045808}, {"filename": "/cancel.png", "start": 7045808, "end": 7047728}, {"filename": "/locale/img/pgdown.png", "start": 7047728, "end": 7049598}, {"filename": "/locale/img/eingabe.png", "start": 7049598, "end": 7051429}, {"filename": "/locale/img/cue.png", "start": 7051429, "end": 7053016}, {"filename": "/queue_shadow.png", "start": 7053016, "end": 7054583}, {"filename": "/locale/img/pgup.png", "start": 7054583, "end": 7056062}, {"filename": "/locale/img/tab.png", "start": 7056062, "end": 7057496}, {"filename": "/tabletex_fB_128x128.png", "start": 7057496, "end": 7058899}, {"filename": "/locale/img/logo.png", "start": 7058899, "end": 7060302}, {"filename": "/locale/img/enter.png", "start": 7060302, "end": 7061679}, {"filename": "/locale/img/f10.png", "start": 7061679, "end": 7063021}, {"filename": "/locale/img/f6.png", "start": 7063021, "end": 7064303}, {"filename": "/locale/img/down1.png", "start": 7064303, "end": 7065581}, {"filename": "/locale/img/f9.png", "start": 7065581, "end": 7066855}, {"filename": "/locale/img/f8.png", "start": 7066855, "end": 7068129}, {"filename": "/locale/img/f3.png", "start": 7068129, "end": 7069393}, {"filename": "/locale/img/right.png", "start": 7069393, "end": 7070654}, {"filename": "/locale/img/left.png", "start": 7070654, "end": 7071910}, {"filename": "/locale/img/up1.png", "start": 7071910, "end": 7073164}, {"filename": "/locale/img/f2.png", "start": 7073164, "end": 7074399}, {"filename": "/locale/img/f5.png", "start": 7074399, "end": 7075621}, {"filename": "/locale/img/f4.png", "start": 7075621, "end": 7076814}, {"filename": "/locale/img/m.png", "start": 7076814, "end": 7077996}, {"filename": "/locale/img/s.png", "start": 7077996, "end": 7079168}, {"filename": "/blende.png", "start": 7079168, "end": 7080335}, {"filename": "/locale/img/b.png", "start": 7080335, "end": 7081493}, {"filename": "/locale/img/8.png", "start": 7081493, "end": 7082642}, {"filename": "/locale/img/f7.png", "start": 7082642, "end": 7083765}, {"filename": "/locale/img/6.png", "start": 7083765, "end": 7084888}, {"filename": "/locale/img/9.png", "start": 7084888, "end": 7086007}, {"filename": "/locale/img/v.png", "start": 7086007, "end": 7087123}, {"filename": "/locale/img/f1.png", "start": 7087123, "end": 7088237}, {"filename": "/locale/img/u.png", "start": 7088237, "end": 7089339}, {"filename": "/locale/img/0.png", "start": 7089339, "end": 7090435}, {"filename": "/locale/img/r.png", "start": 7090435, "end": 7091526}, {"filename": "/locale/img/3.png", "start": 7091526, "end": 7092612}, {"filename": "/locale/img/back.png", "start": 7092612, "end": 7093683}, {"filename": "/locale/img/next.png", "start": 7093683, "end": 7094751}, {"filename": "/locale/img/2.png", "start": 7094751, "end": 7095808}, {"filename": "/locale/img/e.png", "start": 7095808, "end": 7096860}, {"filename": "/locale/img/4.png", "start": 7096860, "end": 7097907}, {"filename": "/locale/img/5.png", "start": 7097907, "end": 7098952}, {"filename": "/locale/img/f.png", "start": 7098952, "end": 7099971}, {"filename": "/locale/img/7.png", "start": 7099971, "end": 7100988}, {"filename": "/locale/img/1.png", "start": 7100988, "end": 7101967}, {"filename": "/locale/img/l.png", "start": 7101967, "end": 7102897}, {"filename": "/music/music.txt", "start": 7102897, "end": 7103822}, {"filename": "/html/images/footer-bg.png", "start": 7103822, "end": 7104516}, {"filename": "/locale/css/help.css", "start": 7104516, "end": 7105146}, {"filename": "/locale/css/help1.css", "start": 7105146, "end": 7105775}, {"filename": "/html/tournament.xml", "start": 7105775, "end": 7106383}, {"filename": "/html/history.xml", "start": 7106383, "end": 7106899}, {"filename": "/html/images/content-bg.png", "start": 7106899, "end": 7107239}, {"filename": "/html/images/body-bg.png", "start": 7107239, "end": 7107575}, {"filename": "/html/images/sidebar-h3-bg.jpg", "start": 7107575, "end": 7107885}], "remote_package_size": 7107885, "package_uuid": "d078494c-122e-47da-9b28-13dcd40bf1a7"});

  })();
