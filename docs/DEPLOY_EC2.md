# Deploy to EC2 (GitHub Actions)

## Required GitHub secrets

- **EC2_HOST** – Public IP or public DNS of your EC2 instance (e.g. `3.14.159.265` or `ec2-xx-xx-xx-xx.compute.amazonaws.com`).
- **EC2_SSH_KEY** – Full contents of your EC2 SSH private key (`.pem`), including `-----BEGIN ... KEY-----` and `-----END ... KEY-----`.
- **DOCKER_USERNAME** / **DOCKER_PASSWORD** – For pushing images to Docker Hub.

## "dial tcp ***:22: i/o timeout"

This means the runner cannot reach your EC2 on port 22 (SSH). Fix it on AWS:

1. **EC2 Security Group**
   - Open the Security Group attached to your instance.
   - **Inbound rules** → Add (or edit):
     - Type: **SSH**
     - Port: **22**
     - Source: **0.0.0.0/0** (any IP; key-based SSH is still required).
   - Save the rules.

2. **EC2_HOST**
   - Must be the **public** IP or public DNS of the instance (from EC2 console).
   - Not the private IP.

3. **Instance**
   - Instance must be **running** and in a subnet that has a route to the internet (e.g. public subnet with Internet Gateway).

4. **Optional: custom SSH port**
   - If SSH listens on a port other than 22, add secret **EC2_SSH_PORT** and use it in the workflow `port` input for `appleboy/ssh-action`.

After opening port 22 and confirming the host, re-run the workflow or push to `main`.
