#!/bin/sh
### BEGIN INIT INFO
# Provides:
# Required-Start:    $remote_fs $syslog
# Required-Stop:     $remote_fs $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Start daemon at boot time
# Description:       Enable service provided by daemon.
### END INIT INFO

dir="/srv/axnet"
user=""
cmd="node server.js"

name=`basename $0`
pid_file="$name.pid"
stdout_log="$name.log"
stderr_log="$name.err"


# ---------------------------------------------------------------------------
get_pid () {
  cat "$pid_file"
}


# ---------------------------------------------------------------------------
is_running () {
  [ -f "$pid_file" ] && ps `get_pid` > /dev/null 2>&1
}


# ---------------------------------------------------------------------------
start () {
  echo "Starting $name"
  $cmd > "$stdout_log" 2> "$stderr_log" &
  echo $! > "$pid_file"
  if ! is_running; then
    echo "Unable to start, see $stdout_log and $stderr_log"
    exit 1
  fi
}


# ---------------------------------------------------------------------------
stop () {
  echo -n "Stopping $name.."
  kill `get_pid`
  for i in {1..10}
  do
    if ! is_running; then
      break
    fi

    echo -n "."
    sleep 1
  done
  echo

  if is_running; then
    echo "Not stopped; may still be shutting down or shutdown may have failed"
    exit 1
  else
    echo "Stopped"
    if [ -f "$pid_file" ]; then
      rm "$pid_file"
    fi
  fi
}


# ---------------------------------------------------------------------------
update () {
  git pull origin master
  git clean -f
  chmod 755 axnetd.sh
}

# ---------------------------------------------------------------------------
# ---------------------------------------------------------------------------

cd "$dir"

case "$1" in
    
  start)
    if is_running; then
      echo "Already started"
    else
      start
    fi
  ;;

  stop)
    if is_running; then
      stop
    else
      echo "Not running"
    fi
  ;;

  restart)
    stop
    if is_running; then
        echo "Unable to stop, will not attempt to start"
        exit 1
    fi
    start
  ;;

  update)
    update
    stop
    if is_running; then
        echo "Unable to stop, will not attempt to start"
        exit 1
    fi
    start
  ;;

  status)
    if is_running; then
        echo "Running"
    else
        echo "Stopped"
        exit 1
    fi
  ;;

  *)
    echo "Usage: $0 {start|stop|restart|update|status}"
    exit 1
  ;;
esac

exit 0

# ---------------------------------------------------------------------------
# ---------------------------------------------------------------------------
