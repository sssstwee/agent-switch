#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" != "run" ]]; then
  exec cargo "$@"
fi

args=("$@")
build_args=("build")
app_args=()
profile="debug"
target=""
after_separator=0

for ((i = 1; i < ${#args[@]}; i += 1)); do
  arg="${args[$i]}"
  if ((after_separator)); then
    app_args+=("$arg")
    continue
  fi

  if [[ "$arg" == "--" ]]; then
    after_separator=1
    continue
  fi

  build_args+=("$arg")
  if [[ "$arg" == "--release" ]]; then
    profile="release"
  elif [[ "$arg" == "--target" && $((i + 1)) -lt ${#args[@]} ]]; then
    target="${args[$((i + 1))]}"
  elif [[ "$arg" == --target=* ]]; then
    target="${arg#--target=}"
  fi
done

cargo "${build_args[@]}"

target_dir="${CARGO_TARGET_DIR:-target}"
if [[ -n "$target" ]]; then
  binary_dir="$target_dir/$target/$profile"
else
  binary_dir="$target_dir/$profile"
fi

source_binary="$binary_dir/switchpp"
display_binary="$binary_dir/Switch++"
rm -f "$display_binary"
cp "$source_binary" "$display_binary"
chmod +x "$display_binary"
if ((${#app_args[@]})); then
  exec "$display_binary" "${app_args[@]}"
else
  exec "$display_binary"
fi
