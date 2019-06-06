
module filter3x3(
    input clk,
    input video_ready,
    input [31:0] pixel_in,
    output [31:0] pixel_out
);
    reg [7:0] brightness_in;
    reg [15:0] brightness_out;
    wire [7:0] p1, p2, p3,
               p4, p5, p6,
               p7, p8, p9;

    fifo3rows F(clk,
                video_ready,
                brightness_in,
                p1, p2, p3,
                p4, p5, p6,
                p7, p8, p9);
    
    always @(posedge clk) begin
        brightness_in <= (pixel_in[7:0] >> 2) + (pixel_in[15:8] >> 1) + (pixel_in[23:16] >> 2);
        brightness_out <= p3 + p6 + p6 + p9 - p1 - p4 - p4 - p7; // horizontal sobel filter
    end
    
    assign pixel_out = { 8'b0, 8'b0, brightness_out[7:0], brightness_out[7:0], brightness_out[7:0] };

endmodule



module fifo3rows(input clk,
                input en,
                input [7:0] data_in,
                output reg [7:0] out1,
                output reg [7:0] out2,
                output reg [7:0] out3,
                output reg [7:0] out4,
                output reg [7:0] out5,
                output reg [7:0] out6,
                output reg [7:0] out7,
                output reg [7:0] out8,
                output reg [7:0] out9
                );

    reg [7:0] mem [4095:0];
    reg [11:0] waddr = 3839;
    reg [11:0] raddr1 = 0;
    reg [11:0] raddr2 = 1280;
    reg [11:0] raddr3 = 2560;

    always @(posedge clk) begin
        if ( en ) begin
            if ( waddr == 3840 ) begin
                waddr <= 0;
            end else begin
                waddr <= waddr + 1;
            end
            if ( raddr1 == 3840 ) begin
                raddr1 <= 0;
            end else begin
                raddr1 <= raddr1 + 1;
            end
            if ( raddr2 == 3840 ) begin
                raddr2 <= 0;
            end else begin
                raddr2 <= raddr2 + 1;
            end
            if ( raddr3 == 3840 ) begin
                raddr3 <= 0;
            end else begin
                raddr3 <= raddr3 + 1;
            end
            mem[waddr] <= data_in;
            out1 <= mem[raddr1];
            out2 <= mem[raddr1+1];
            out3 <= mem[raddr1+2];
            out4 <= mem[raddr2];
            out5 <= mem[raddr2+1];
            out6 <= mem[raddr2+2];
            out7 <= mem[raddr3];
            out8 <= mem[raddr3+1];
            out9 <= mem[raddr3+2];
        end
    end
endmodule
