{pkgs}: {
  deps = [
    pkgs.k3s_1_28
    pkgs.nvidia-docker
    pkgs.google-cloud-sdk-gce
  ];
}
